"""Banking and financial validation utilities."""

import re
from typing import Optional


class BankingValidator:
    """Validators for banking and financial information."""

    @staticmethod
    def validate_bank_account(account_number: str) -> bool:
        """
        Validate bank account number format.

        Args:
            account_number: Bank account number to validate

        Returns:
            True if format is valid, False otherwise
        """
        if not account_number:
            return False

        # Remove spaces and dashes
        cleaned = re.sub(r'[\s\-]', '', account_number)

        # Account numbers are typically 8-17 digits
        if not re.match(r'^\d{8,17}$', cleaned):
            return False

        return True

    @staticmethod
    def validate_routing_number(routing_number: str) -> bool:
        """
        Validate US routing number (ABA number) format.

        Args:
            routing_number: Routing number to validate

        Returns:
            True if format is valid, False otherwise
        """
        if not routing_number:
            return False

        # Remove spaces and dashes
        cleaned = re.sub(r'[\s\-]', '', routing_number)

        # US routing numbers are exactly 9 digits
        if not re.match(r'^\d{9}$', cleaned):
            return False

        # Validate checksum (ABA routing number checksum algorithm)
        digits = [int(d) for d in cleaned]
        checksum = (
            3 * (digits[0] + digits[3] + digits[6]) +
            7 * (digits[1] + digits[4] + digits[7]) +
            1 * (digits[2] + digits[5] + digits[8])
        )

        return checksum % 10 == 0

    @staticmethod
    def validate_iban(iban: str) -> bool:
        """
        Validate IBAN (International Bank Account Number) format.

        Args:
            iban: IBAN to validate

        Returns:
            True if format is valid, False otherwise
        """
        if not iban:
            return False

        # Remove spaces and convert to uppercase
        cleaned = re.sub(r'\s', '', iban).upper()

        # IBAN must be 15-34 alphanumeric characters
        if not re.match(r'^[A-Z]{2}\d{2}[A-Z0-9]+$', cleaned):
            return False

        if len(cleaned) < 15 or len(cleaned) > 34:
            return False

        # Move first 4 characters to end
        rearranged = cleaned[4:] + cleaned[:4]

        # Replace letters with numbers (A=10, B=11, ..., Z=35)
        numeric = ''
        for char in rearranged:
            if char.isdigit():
                numeric += char
            else:
                numeric += str(ord(char) - ord('A') + 10)

        # Check mod 97
        return int(numeric) % 97 == 1

    @staticmethod
    def validate_swift_code(swift: str) -> bool:
        """
        Validate SWIFT/BIC code format.

        Args:
            swift: SWIFT/BIC code to validate

        Returns:
            True if format is valid, False otherwise
        """
        if not swift:
            return False

        # Remove spaces and convert to uppercase
        cleaned = re.sub(r'\s', '', swift).upper()

        # SWIFT codes are 8 or 11 characters
        # Format: AAAABBCCXXX (bank code, country code, location code, branch code)
        if not re.match(r'^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$', cleaned):
            return False

        return True
