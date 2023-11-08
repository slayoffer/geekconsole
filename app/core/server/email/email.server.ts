export async function sendEmail(options: {
	to: string;
	subject: string;
	html?: string;
	text: string;
}) {
	const email = { ...options };

	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		body: JSON.stringify(email),
		headers: {
			Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
			'content-type': 'application/json',
		},
	});

	const data = await response.json();
	console.log(data);
}
