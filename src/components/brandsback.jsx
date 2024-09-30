import Slider from 'react-infinite-logo-slider'
import { FaNodeJs, FaDocker, FaPython } from 'react-icons/fa';
import { SiFirebase, SiPostgresql, SiFlask } from 'react-icons/si';

const BrandsBack = () => {

    return (
            <Slider
                width="90px"
                duration={40}
                pauseOnHover={true}
                blurBorders={false}
                blurBoderColor={'#fff'}
            >
                <Slider.Slide>
                    <FaNodeJs size={36} />
                </Slider.Slide>
                <Slider.Slide>
                    <SiFirebase size={36} />
                </Slider.Slide>
                <Slider.Slide>
                    <SiPostgresql size={36} />
                </Slider.Slide>
                <Slider.Slide>
                    <FaDocker size={36} />
                </Slider.Slide>
                <Slider.Slide>
                    <SiFlask size={36} />
                </Slider.Slide>
                <Slider.Slide>
                    <FaPython size={36} />
                </Slider.Slide>
            </Slider>
    )
}

export default BrandsBack;
