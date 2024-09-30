import Slider from 'react-infinite-logo-slider'
import { FaReact, FaJs, FaGitAlt, FaGithub } from 'react-icons/fa';
import { SiTailwindcss, SiVite, SiSass, SiAstro } from 'react-icons/si';

const BrandsFront = () => {

    return (
            <Slider
                width="90px"
                duration={40}
                pauseOnHover={true}
                blurBorders={false}
                blurBoderColor={'#fff'}
            >
                <Slider.Slide>
                    <FaReact size={36} />
                </Slider.Slide>
                <Slider.Slide>
                    <FaJs size={36} />
                </Slider.Slide>
                <Slider.Slide>
                    <SiTailwindcss size={36} />
                </Slider.Slide>
                <Slider.Slide>
                    <SiSass size={36} />
                </Slider.Slide>
                <Slider.Slide>
                    <FaGitAlt size={36} />
                </Slider.Slide>
                <Slider.Slide>
                    <SiVite size={36} />
                </Slider.Slide>
                <Slider.Slide>
                    <SiAstro size={36} />
                </Slider.Slide>
                <Slider.Slide>
                    <FaGithub size={36} />
                </Slider.Slide>
            </Slider>
    )
}

export default BrandsFront;
