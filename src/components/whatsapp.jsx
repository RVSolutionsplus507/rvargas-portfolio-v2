import WhatsAppWidget from "react-whatsapp-chat-widget";
import "react-whatsapp-chat-widget/index.css";
import CompanyIcon from "@/assets/fotoRV.png";
import { useTranslation } from "react-i18next";

function Whatsapp() {
    const [t] = useTranslation("whatsapp");
    return (
        <WhatsAppWidget
            phoneNo="50761083193"
            chatPersonName="Roberto Vargas"
            // messageBoxTx="Normalmente respondemos antes de 24 hrs"
            chatMessage={
                <>
                    <p> {t("hi")} 👋🏼</p>
                    <br />
                    <p> {t("help")}</p>
                </>
            }
            sendButtonText={t("submit")}
            inputPlaceHolder={t("text")}
            headerIcon={CompanyIcon}
            headerCaption={t("online")}
            headerTitle="Roberto Vargas"
            btnTxt={t("submit")}
            iconSize="60"
        />
    );
}

export default Whatsapp;
