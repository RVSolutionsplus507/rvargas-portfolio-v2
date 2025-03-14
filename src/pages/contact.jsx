import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'
import confetti from 'canvas-confetti'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from 'react-i18next'
import { sendCustomEmail } from "@/components/email";
import { setupCSRF } from "@/lib/utils";

export default function ContactPage() {
  const { t } = useTranslation("contact")
  const { register, reset, handleSubmit, formState: { errors } } = useForm()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [csrfToken, setCsrfToken] = useState("");
//   const [details, setDetails] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     message: ""
// });
useEffect(() => {
  // Generate and set CSRF token when component mounts
  const token = setupCSRF();
  setCsrfToken(token);
}, []);


useEffect(() => {
  let intervalId;

  if (isSubmitted) {
      intervalId = setInterval(() => {
          setIsSubmitted(false);
      }, 3000);
  }

  return () => {
      clearInterval(intervalId);
  };
}, [isSubmitted]);

  const onSubmit = (data) => {
    const dataWithToken = {
      ...data,
      csrfToken
    };
    sendCustomEmail(dataWithToken);
    setIsSubmitted(true)
    reset()
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }

  return (
    <div className="mx-auto lg:p-6 overflow-x-hidden ">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-8 text-center"
      >
        <h1 className="text-4xl font-bold">{t("contact")}</h1>
        <p className="mt-2 text-xl text-primary">{t("hear")}</p>
      </motion.header>

      <main className="mx-auto py-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{t("touch")}</CardTitle>
                <CardDescription>{t("description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Input
                      {...register("name", { required: t("namerequired")})}
                      placeholder={t("name")}
                      
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <Input
                      {...register("phone", { required: t("cellphonerequired") })}
                      placeholder={t("cellphone")}
                      
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <Input
                      {...register("email", { 
                        required: t("emailrequired"),
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: t("invalidemail")
                        }
                      })}
                      placeholder={t("email")}
                      
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <Textarea
                      {...register("message", { required: t("messagerequired")})}
                      placeholder={t("message")}
                      rows={4}
                     
                    />
                    {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                  </div>
                  <Button type="submit" className="w-full">
                  {t("send")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{t("contactinfo")}</CardTitle>
                <CardDescription>{t("contactdescription")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FaEnvelope className="text-primary" />
                  <span>rvargas@rv-solutions.net</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaPhone className="text-primary" />
                  <span>+507 6108-3193</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaMapMarkerAlt className="text-primary" />
                  <span>Ciudad de Panama, Panama</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg"
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126916.70954660845!2d-79.58598449454697!3d8.983333025592013!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8faca8f1dbe80363%3A0xaba25df1f042c10e!2sPanama%20City%2C%20Panama!5e0!3m2!1sen!2sus!4v1685389171961!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </motion.div>
      </main>

      {isSubmitted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">{t("thanks")}</h2>
            <p className="text-gray-700">{t("messagedelivered")}</p>
            <Button onClick={() => setIsSubmitted(false)} className="mt-4">
              Close
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}