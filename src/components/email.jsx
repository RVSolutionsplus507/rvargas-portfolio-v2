import emailjs from "@emailjs/browser";

export const sendCustomEmail = data => {
    const userId = import.meta.env.VITE_EMAIL_USER_ID;
    const serviceId = import.meta.env.VITE_EMAIL_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAIL_TEMPLATE_ID;

    if (!userId || !serviceId || !templateId) {
        console.error("EmailJS environment variables are not set correctly.");
        return;
    }

    emailjs.init(userId);
    emailjs
        .send(
            serviceId,
            templateId,
            {
                name: data.name,
                email: data.email,
                phone: data.phone,
                message: data.message
            }
        )
        .then(response => {
            console.log("SUCCESS!", response.status, response.text);
        })
        .catch(err => {
            console.log("FAILED...", err);
        });
};
