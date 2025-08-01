import img2 from "../assets/img/2.png";
import img3 from "../assets/img/3.png";
import img4 from "../assets/img/4.png";
import photo1 from "../assets/img/photo-1511721464821-5641710d5bf2.png";
import planBg1 from "../assets/img/plan-bg1.png";

export const images = [img2, img3, img4, photo1, planBg1];

export const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
};
