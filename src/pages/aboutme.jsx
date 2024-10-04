import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Carousel } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { FiBook, FiCode, FiAward } from "react-icons/fi";
import { FaPlane, FaSmile, FaStar } from "react-icons/fa";
import BrandsFront from "@/components/brandsfront";
import BrandsBack from "@/components/brandsback";
import { useTranslation } from "react-i18next";

import imagereview1 from "@/assets/ReviewsImages/mauad.webp";
import imagereview2 from "@/assets/ReviewsImages/jd.webp";
import imagereview3 from "@/assets/ReviewsImages/juanjo.webp";

function AboutMe() {
  const [t] = useTranslation("aboutme");
  const reviews = [
    {
      image: imagereview1,
      name: "Mauad & Mauad",
      content: t("contentreview1"),
      rating: 5,
    },
    {
      image: imagereview2,
      name: "Jacinta Delgado",
      content: t("contentreview2"),
        
      rating: 5,
    },
    {
      image: imagereview3,
      name: "Juan Boschetti",
      content: t("contentreview3"),
      rating: 5,
    },
  ];

  const timeline = [
    { year: 2013, event: t("timeline1") },
    { year: 2015, event: t("timeline2") },
    { year: 2023, event: t("timeline3") },
    { year: 2024, event: t("timeline4") },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="container mx-auto p-6 overflow-y-auto">
      <h1 className="text-4xl font-bold mb-8">{t("about")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ duration: 0.5 }}
          className="md:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-[#189b49]">
              {t("whoami")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
              {t("whoamicontent")}
              </p>
              <div className="lg:flex mt-4 lg:space-x-2 md:grid md:grid-col-2">
                <Badge variant="default">
                  <FiCode className="mr-1" />{t("badge1")}
                </Badge>
                <Badge variant="default">
                  <FaPlane className="mr-1" /> {t("badge2")}
                </Badge>
                <Badge variant="default">
                  <FaSmile className="mr-1" /> {t("badge2")}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-[#189b49]">{t("skillstitle")}</CardTitle>
              <CardDescription>{t("skillsdescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardTitle className="font-bold text-[#189b49]">
              {t("skilltitlefront")}
              </CardTitle>
              <BrandsFront />
              <CardTitle className="font-bold text-[#189b49]">
              {t("skilltitleback")}
              </CardTitle>
              <BrandsBack />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-[#189b49]">
              {t("timelinetitle")}
              </CardTitle>
              <CardDescription>{t("timelinedescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Badge variant="outline" className="w-16 justify-center">
                        {item.year}
                      </Badge>
                    </div>
                    <div className="flex-grow">
                      <div className="h-0.5 bg-muted-foreground/20 relative">
                        <div className="absolute left-0 -top-1.5 w-3 h-3 rounded-full bg-primary" />
                      </div>
                    </div>
                    <div className="flex-grow">{item.event}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-[#189b49]">
              {t("educationtitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <FiBook className="text-muted-foreground" />
                <span> {t("education1")}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiAward className="text-muted-foreground" />
                <span> {t("education2")}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiAward className="text-muted-foreground" />
                <span> {t("education3")}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiAward className="text-muted-foreground" />
                <span> {t("education4")}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-[#189b49]">
              {t("interests")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>{t("interests1")}</li>
                <li>{t("interests2")}</li>
                <li>{t("interests3")}</li>
                <li>{t("interests4")}</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="md:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-[#189b49]">
              {t("reviewstitle")}
              </CardTitle>
              <CardDescription>{t("reviewsdescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Carousel className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reviews.map((review, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center space-y-4"
                  >
                    <img
                      src={review.image}
                      alt={review.name}
                      className="w-24 h-24 rounded-full object-contain dark:bg-white"
                    />
                    <h3 className="text-lg font-semibold">{review.name}</h3>
                    <p className="text-center">{review.content}</p>
                    <div className="flex space-x-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <FaStar key={i} className="text-yellow-500" />
                      ))}
                    </div>
                  </div>
                ))}
              </Carousel>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default AboutMe;
