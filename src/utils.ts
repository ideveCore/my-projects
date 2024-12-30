import PasswordValidator from 'password-validator';
import EmailValidator from "email-validator";
import { encodeBase32LowerCase } from '@oslojs/encoding';

export const validate = {
	email: (email: string) => {
		return EmailValidator.validate(email);
	},
	password: function (password: string) {
		return this.password_test.validate(password);
	},
	password_test: new PasswordValidator()
		.is()
		.min(8)
		.is()
		.max(100)
		.has()
		.uppercase()
		.has()
		.lowercase()
		.has()
		.digits(2)
		.has()
		.not()
		.spaces()
		.is()
		.not()
		.oneOf(['12345678', 'asdf', '12345678@']),
	password_rules: [
		{
			validation: "min",
			arguments: 8,
			message: "The string should have a minimum length of 8 characters"
		},
		{
			validation: "uppercase",
			message: "The string should have a minimum of 1 uppercase letter"
		},
		{
			validation: "lowercase",
			message: "The string should have a minimum of 1 lowercase letter"
		},
		{
			validation: "digits",
			arguments: 2,
			message: "The string should have a minimum of 2 digits"
		},
	],
};

export const uuid = () => {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}
