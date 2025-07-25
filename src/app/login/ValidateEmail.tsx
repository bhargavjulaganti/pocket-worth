export class EmailValidator {
  static validateEmail(value: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return null;
    return emailRegex.test(value) ? null : "Enter a valid email address";
  }
}