import emailjs from "@emailjs/browser";

export const sendCustomEmail = (data) => {
    emailjs.init(import.meta.env.VITE_EMAIL_PUBLIC_KEY);
    emailjs
        .send(
            import.meta.env.VITE_EMAIL_SERVICE_ID,
            import.meta.env.VITE_EMAIL_TEMPLATE_ID,
            {
                name: data.name,
                email: data.email,
                phone: data.phone,
                message: data.message
            },
            import.meta.env.VITE_EMAIL_PUBLIC_KEY
        )
        .then(response => {
            console.log("SUCCESS!", response.status, response.text);
        })
        .catch(err => {
            console.log("FAILED...", err);
        });
};