import React from "react";
import { FooterLink2 } from "../../data/footer-links";
import { Link } from "react-router-dom";

// Images
import Logo from "../../assets/Logo/onehandimagelogodark.png";

// Icons
import { FaFacebook, FaGoogle, FaTwitter, FaYoutube } from "react-icons/fa";

const BottomFooter = ["Privacy Policy", "Cookie Policy", "Terms"];
const Resources = [
  "Articles",
  "Blog",
  "Chart Sheet",
  "Code challenges",
  "Docs",
  "Projects",
  "Videos",
  "Workspaces",
];
const Plans = ["Paid memberships", "For students", "Business solutions"];
const Community = ["Forums", "Chapters", "Events"];

const FooterCol = ({ title, children }) => (
  <div className="flex flex-col gap-3">
    <h3 className="mb-5 text-lg font-semibold text-gold-300">
      {title}
    </h3>
    <div className="flex flex-col gap-2">{children}</div>
  </div>
);

const FooterLinkItem = ({ to, children }) => (
  <Link
    to={to}
    className="text-ink-300 transition-all duration-300 hover:translate-x-1 hover:text-gold-400"
  >
    {children}
  </Link>
);

const Footer = () => {
  return (
    <footer className="bg-ink-900 border-t border-gold-700/30">
      <div className="mx-auto w-11/12 max-w-maxContent py-20">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-6">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-2 flex flex-col gap-6">
            <img
              src={Logo}
              alt="OpenHand"
              className="w-44"
            />
            <p className="max-w-sm text-[15px] leading-7 text-ink-200">
              Empowering coaches, therapists, mentors, and educators with a thoughtful
              digital space to connect, support, and grow meaningful communities.
            </p>
            <div className="flex gap-4">

              {[FaFacebook, FaGoogle, FaTwitter, FaYoutube].map((Icon, i) => (

                <a
                  key={i}
                  href="#"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-700 bg-ink-800 text-ink-200 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500 hover:bg-gold-500 hover:text-ink-900"
                >
                  <Icon />
                </a>

              ))}

            </div>
          </div>


          <FooterCol title="Company">
            {["About", "Careers", "Affiliates"].map((ele, i) => (
              <FooterLinkItem key={i} to={ele.toLowerCase()}>
                {ele}
              </FooterLinkItem>
            ))}
          </FooterCol>

          <FooterCol title="Resources">
            {Resources.map((ele, i) => (
              <FooterLinkItem key={i} to={ele.split(" ").join("-").toLowerCase()}>
                {ele}
              </FooterLinkItem>
            ))}
          </FooterCol>

          <FooterCol title="Plans">
            {Plans.map((ele, i) => (
              <FooterLinkItem key={i} to={ele.split(" ").join("-").toLowerCase()}>
                {ele}
              </FooterLinkItem>
            ))}
          </FooterCol>

          <FooterCol title="Community">
            {Community.map((ele, i) => (
              <FooterLinkItem key={i} to={ele.split(" ").join("-").toLowerCase()}>
                {ele}
              </FooterLinkItem>
            ))}
          </FooterCol>

          {FooterLink2.map((ele, i) => (
            <FooterCol key={i} title={ele.title}>
              {ele.links.map((link, index) => (
                <FooterLinkItem key={index} to={link.link}>
                  {link.title}
                </FooterLinkItem>
              ))}
            </FooterCol>
          ))}

          <FooterCol title="Support">
            <FooterLinkItem to="/help-center">Help Center</FooterLinkItem>
          </FooterCol>
        </div>

        <div className="my-16 h-px w-full bg-gradient-to-r from-transparent via-gold-600/40 to-transparent" />
        <div className="mt-8 flex flex-col-reverse items-center justify-between gap-4 text-sm sm:flex-row">
          <p className="text-ink-300">
            © {new Date().getFullYear()} openhand.live — Your practice, held
            online.
          </p>
          <div className="flex flex-col gap-6 lg:flex-row justify-between items-center">
            {BottomFooter.map((ele, i) => (
              <div
                key={i}
                className={`${BottomFooter.length - 1 === i ? "" : "border-r border-ink-600"
                  } px-3`}
              >
                <Link
                  to={ele.split(" ").join("-").toLowerCase()}
                  className="text-ink-200 transition-colors duration-150 hover:text-gold-500"
                >
                  {ele}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;