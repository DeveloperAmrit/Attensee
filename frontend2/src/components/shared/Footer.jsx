
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} DeveloperAmrit. All rights reserved.</p>
        <div className="mt-4">
          <a
            href="https://github.com/DeveloperAmrit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-400 mx-3"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/amrit-kumar-yadav/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-400 mx-3"
          >
            LinkedIn
          </a>
          <a
            href="mailto:b24cm1008@iitj.ac.in"
            className="text-white hover:text-gray-400 mx-3"
          >
            Email
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
