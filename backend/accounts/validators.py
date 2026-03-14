import re
from django.core.exceptions import ValidationError


class FiveDigitNumericPasswordValidator:
    def validate(self, password, user=None):
        if not re.fullmatch(r"\d{5}", password or ""):
            raise ValidationError("Password must be exactly 5 numeric digits.")

    def get_help_text(self):
        return "Your password must be exactly 5 numeric digits."
