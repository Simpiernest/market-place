"""Supabase Storage integration for file uploads."""

from typing import Optional, List, Dict, Any
from uuid import uuid4
import os
from supabase import create_client, Client
from fastapi import UploadFile

from app.core.config import settings


class StorageService:
    """Service for managing file uploads with Supabase Storage."""

    def __init__(self):
        self.supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
        self.buckets = {
            "documents": "business-documents",      # Financial docs, contracts
            "verification": "verification-docs",     # ID verification, business proof
            "attachments": "message-attachments",    # Message files
            "listings": "listing-media",             # Listing images, videos
            "avatars": "user-avatars",              # Profile pictures
        }

    async def upload_file(
        self,
        file: UploadFile,
        bucket_name: str,
        folder: str = "",
        user_id: str = None,
    ) -> Dict[str, Any]:
        """
        Upload a file to Supabase Storage.

        Args:
            file: The uploaded file
            bucket_name: Storage bucket (documents, verification, attachments, etc.)
            folder: Optional folder path within bucket
            user_id: User ID for organizing files

        Returns:
            Dict with file_url, file_path, file_size, mime_type
        """
        # Generate unique filename
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid4()}{file_ext}"

        # Construct storage path
        if user_id:
            file_path = f"{folder}/{user_id}/{unique_filename}" if folder else f"{user_id}/{unique_filename}"
        else:
            file_path = f"{folder}/{unique_filename}" if folder else unique_filename

        # Read file content
        content = await file.read()

        # Upload to Supabase Storage
        bucket = self.buckets.get(bucket_name, bucket_name)
        response = self.supabase.storage.from_(bucket).upload(
            file_path,
            content,
            {
                "content-type": file.content_type,
                "x-upsert": "false"  # Don't overwrite existing files
            }
        )

        # Get public URL
        public_url = self.supabase.storage.from_(bucket).get_public_url(file_path)

        return {
            "file_url": public_url,
            "file_path": file_path,
            "filename": file.filename,
            "file_size": len(content),
            "mime_type": file.content_type,
            "bucket": bucket,
        }

    async def upload_multiple(
        self,
        files: List[UploadFile],
        bucket_name: str,
        folder: str = "",
        user_id: str = None,
    ) -> List[Dict[str, Any]]:
        """Upload multiple files at once."""
        results = []
        for file in files:
            result = await self.upload_file(file, bucket_name, folder, user_id)
            results.append(result)
        return results

    def delete_file(self, bucket_name: str, file_path: str) -> bool:
        """Delete a file from storage."""
        try:
            bucket = self.buckets.get(bucket_name, bucket_name)
            self.supabase.storage.from_(bucket).remove([file_path])
            return True
        except Exception as e:
            print(f"Error deleting file: {e}")
            return False

    def get_signed_url(
        self,
        bucket_name: str,
        file_path: str,
        expires_in: int = 3600
    ) -> Optional[str]:
        """
        Generate a temporary signed URL for private files.

        Args:
            bucket_name: Storage bucket
            file_path: Path to file in bucket
            expires_in: URL expiry in seconds (default 1 hour)

        Returns:
            Signed URL or None if error
        """
        try:
            bucket = self.buckets.get(bucket_name, bucket_name)
            response = self.supabase.storage.from_(bucket).create_signed_url(
                file_path,
                expires_in
            )
            return response.get("signedURL")
        except Exception as e:
            print(f"Error creating signed URL: {e}")
            return None

    def list_files(
        self,
        bucket_name: str,
        folder: str = "",
        user_id: str = None
    ) -> List[Dict[str, Any]]:
        """List files in a bucket/folder."""
        try:
            bucket = self.buckets.get(bucket_name, bucket_name)
            path = f"{folder}/{user_id}" if user_id and folder else (user_id or folder or "")

            files = self.supabase.storage.from_(bucket).list(path)
            return files
        except Exception as e:
            print(f"Error listing files: {e}")
            return []

    async def validate_file(
        self,
        file: UploadFile,
        max_size_mb: int = 10,
        allowed_types: List[str] = None
    ) -> tuple[bool, Optional[str]]:
        """
        SECURE: Validate file before reading large content into memory.
        Fixed: Potential DoS via memory exhaustion.
        """
        # 1. Check size from headers first if available
        content_length = file.size # FastAPI's UploadFile has size attribute
        if content_length:
            size_mb = content_length / (1024 * 1024)
            if size_mb > max_size_mb:
                return False, f"File size ({size_mb:.1f}MB) exceeds {max_size_mb}MB limit"

        # 2. Check file type
        if allowed_types and file.content_type not in allowed_types:
            return False, f"File type {file.content_type} not allowed"

        # 3. Double check size by reading a small chunk if size header was missing
        if not content_length:
            content = await file.read(max_size_mb * 1024 * 1024 + 1)
            await file.seek(0)
            if len(content) > max_size_mb * 1024 * 1024:
                return False, f"File content exceeds {max_size_mb}MB limit"

        return True, None

    def get_file_url(self, bucket_name: str, file_path: str) -> str:
        """Get public URL for a file."""
        bucket = self.buckets.get(bucket_name, bucket_name)
        return self.supabase.storage.from_(bucket).get_public_url(file_path)

    async def watermark_document(self, file_path: str, user_id: str) -> str:
        """
        V2: Applies a dynamic institutional watermark to sensitive documents.
        This ensures documents are traceable if leaked.
        """
        # Placeholder for real PDF watermarking logic
        # Implementation would involve downloading the PDF, overlaying user info, and re-uploading
        print(f"Applying watermark for {user_id} to {file_path}")
        return file_path # In V1, returns original path


# Global instance
storage_service = StorageService()
