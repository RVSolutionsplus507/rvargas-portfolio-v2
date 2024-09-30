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

function AboutMe() {
  const reviews = [
    {
      image: "https://via.placeholder.com/150",
      name: "Mauad & Mauad",
      content:
        "Exceptional IT Manager who consistently delivered high-quality projects ahead of schedule and beyond expectations.",
      rating: 5,
    },
    {
      image: "https://via.placeholder.com/150",
      name: "Jacinta Delgado",
      content: "A top-notch expert who delivers outstanding results. I wouldn't hesitate to recommend them to anyone.",
      rating: 5,
    },
    {
      image: "https://via.placeholder.com/150",
      name: "Juan Boschetti",
      content: "With his analytical and professional approach, he can develop exceptional platforms and streamline our internal operations.",
      rating: 5,
    },
  ];

  const timeline = [
    { year: 2013, event: "Senior Tech Support" },
    { year: 2015, event: "IT Manager" },
    { year: 2023, event: "FullStack Developer" },
    { year: 2024, event: "Latino Tech Leader at Tribu" },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="container mx-auto p-6 overflow-y-auto">
      <h1 className="text-4xl font-bold mb-8">About Me</h1>

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
              <CardTitle className="font-bold text-[#189b49]">Who Am I?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                IT professional, passionate and versatile with a proven track
                record of delivering exceptional results, My expertise lies in
                leveraging cutting-edge technology to drive innovation, enhance
                technological platforms, and optimize resource utilization for
                companies. I am committed to providing a seamless and efficient IT
                experience for my clients, ensuring that their technological needs
                are met with the utmost professionalism and expertise. When Im not
                coding, you can find me exploring new techs, on travel or sleeping
                =).
              </p>
              <div className="lg:flex mt-4 lg:space-x-2 md:grid md:grid-col-2">
                <Badge variant="default">
                  <FiCode className="mr-1" /> Developer
                </Badge>
                <Badge variant="default">
                  <FaPlane className="mr-1" /> Inveterate Traveler
                </Badge>
                <Badge variant="default">
                  <FaSmile className="mr-1" /> Optimistic
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
              <CardTitle className="font-bold text-[#189b49]">Skills</CardTitle>
              <CardDescription>My technical proficiencies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardTitle className="font-bold text-[#189b49]">FrontEnd</CardTitle>
              <BrandsFront />
              <CardTitle className="font-bold text-[#189b49]">BackEnd</CardTitle>
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
              <CardTitle className="font-bold text-[#189b49]">My Journey</CardTitle>
              <CardDescription>Key milestones in my career</CardDescription>
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
              <CardTitle className="font-bold text-[#189b49]">Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <FiBook className="text-muted-foreground" />
                <span>System Engineer</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiAward className="text-muted-foreground" />
                <span>Full-Stack Web Development Certification (4Geeks)</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiAward className="text-muted-foreground" />
                <span>Project Management (ADEN)</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiAward className="text-muted-foreground" />
                <span>IT Support Professional Certificate (Google)</span>
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
              <CardTitle className="font-bold text-[#189b49]">Interests</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Freelance Web/APP Developer</li>
                <li>Process Automatation</li>
                <li>Network Infraestructure</li>
                <li>FullStack Projects</li>
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
              <CardTitle className="font-bold text-[#189b49]">Reviews</CardTitle>
              <CardDescription>What people say about me</CardDescription>
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
                      className="w-24 h-24 rounded-full"
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
