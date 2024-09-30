import { motion } from "framer-motion";
import {
  FaDownload,
  FaPhone,
  FaMapMarkerAlt,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ResumePage = () => {
  const personalInfo = {
    phone: "(507) 6108-3193",
    location: "Ciudad de Panama, Panama",
    github: "https://github.com/johndoe",
    linkedin: "https://linkedin.com/in/johndoe",
  };

  const experiences = [
    {
      title: "Senior Full Stack Developer",
      company: "Tech Innovators Inc.",
      period: "2019 - Present",
      responsibilities: [
        "Led a team of 5 developers in creating a high-performance e-commerce platform",
        "Implemented microservices architecture, improving system scalability by 40%",
        "Mentored junior developers and conducted code reviews",
      ],
    },
    {
      title: "Full Stack Developer",
      company: "Web Solutions LLC",
      period: "2016 - 2019",
      responsibilities: [
        "Developed and maintained multiple client websites using React and Node.js",
        "Optimized database queries, reducing load times by 30%",
        "Integrated third-party APIs for payment processing and social media",
      ],
    },
  ];

  const handleDownload = () => {
    // Replace this URL with the actual URL of your resume PDF
    const resumeUrl = "/path-to-your-resume.pdf";
    const link = document.createElement("a");
    link.href = resumeUrl;
    link.download = "John_Doe_Resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-center items-center">
              <Button
                onClick={handleDownload}
                className="bg-primary hover:bg-primary-dark"
              >
                <FaDownload className="mr-2" />
                Download Resume
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <div className="flex items-center">
                <FaPhone className="mr-2 text-primary" />
                {personalInfo.phone}
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-2 text-primary" />
                {personalInfo.location}
              </div>
              <div className="flex items-center">
                <FaGithub className="mr-2 text-primary" />
                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  GitHub
                </a>
              </div>
              <div className="flex items-center">
                <FaLinkedin className="mr-2 text-primary" />
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Work Experience</CardTitle>
            </CardHeader>
            <CardContent>
              {experiences.map((exp, index) => (
                <div key={index} className="mb-6 last:mb-0">
                  <h3 className="text-lg font-semibold">{exp.title}</h3>
                  <p className="text-primary">{exp.company}</p>
                  <p className="text-sm text-gray-500 mb-2">{exp.period}</p>
                  <ul className="list-disc list-inside">
                    {exp.responsibilities.map((resp, idx) => (
                      <li key={idx} className="text-sm">
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResumePage;
