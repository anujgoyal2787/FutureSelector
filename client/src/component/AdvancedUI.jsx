import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useSpring, useTransform, useVelocity, useAnimationFrame } from "framer-motion";
const wrap = (min, max, v) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};
// 1. Velocity Marquee (Smooth infinite scroll that speeds up on page scroll)
export function VelocityMarquee({ children, baseVelocity = 100 }) {
  const baseX = useTransform(useScroll().scrollYProgress, [0, 1], [0, -100]);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });

  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);
  const directionFactor = useRef(1);
  const ref = useRef(null);

  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() < 0) directionFactor.current = -1;
    else if (velocityFactor.get() > 0) directionFactor.current = 1;

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    
    // Manual DOM manipulation for performance on infinite marquees
    if (ref.current) {
       const currentX = parseFloat(ref.current.style.transform.replace('translateX(', '') || 0);
       let nextX = currentX + moveBy * 0.05;
       if (nextX <= -50) nextX = 0;
       if (nextX > 0) nextX = -50;
       ref.current.style.transform = `translateX(${nextX}%)`;
    }
  });

  return (
    <div className="overflow-hidden whitespace-nowrap m-0 flex flex-nowrap py-12 border-y border-[#1A1A1A]">
      <div ref={ref} className="flex flex-nowrap gap-16 min-w-max">
        {/* Render 4 times to ensure seamless looping */}
        <span className="block font-serif text-[100px] leading-none tracking-tighter text-transparent" style={{ WebkitTextStroke: '1px rgba(212, 197, 176, 0.3)' }}>{children}</span>
        <span className="block font-serif text-[100px] leading-none tracking-tighter text-transparent" style={{ WebkitTextStroke: '1px rgba(212, 197, 176, 0.3)' }}>{children}</span>
        <span className="block font-serif text-[100px] leading-none tracking-tighter text-transparent" style={{ WebkitTextStroke: '1px rgba(212, 197, 176, 0.3)' }}>{children}</span>
        <span className="block font-serif text-[100px] leading-none tracking-tighter text-transparent" style={{ WebkitTextStroke: '1px rgba(212, 197, 176, 0.3)' }}>{children}</span>
      </div>
    </div>
  );
}

// 2. Magnetic Button (Awwwards style)
export function MagneticButton({ children, className }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 }); // 0.3 defines the magnetic strength
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      {children}
    </motion.button>
  );
}

// 3. Hover Image Reveal List
export function CursorRevealList({ items }) {
  const [activeItem, setActiveItem] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMouse = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", updateMouse);
    return () => window.removeEventListener("mousemove", updateMouse);
  }, []);

  return (
    <div className="relative w-full max-w-[1200px] mx-auto group/list">
      {/* Floating Image attached to cursor */}
      <motion.div
        className="fixed top-0 left-0 w-80 h-[400px] pointer-events-none z-50 overflow-hidden hidden md:block"
        animate={{ 
          x: mousePos.x - 160, 
          y: mousePos.y - 200,
          opacity: activeItem ? 1 : 0,
          scale: activeItem ? 1 : 0.8
        }}
        transition={{ type: "spring", damping: 30, stiffness: 200, mass: 0.5 }}
      >
        <div className="w-full h-full relative">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
              style={{ 
                backgroundImage: `url(${item.image})`, 
                opacity: activeItem === item.id ? 1 : 0,
                filter: 'grayscale(100%) contrast(1.2)'
              }}
            >
              <div className="absolute inset-0 bg-champagne/20 mix-blend-overlay"></div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* The List */}
      <div className="flex flex-col border-t border-[#1A1A1A]">
        {items.map((item) => (
          <div 
            key={item.id}
            onMouseEnter={() => setActiveItem(item.id)}
            onMouseLeave={() => setActiveItem(null)}
            className="flex items-center justify-between py-12 border-b border-[#1A1A1A] group cursor-pointer transition-colors hover:bg-[#0A0A0A]"
          >
            <div className="flex flex-col">
              <h3 className="font-serif text-5xl text-warmWhite group-hover:text-champagne group-hover:translate-x-4 transition-all duration-500">
                {item.name}
              </h3>
              <p className="text-xs uppercase tracking-[0.3em] text-mutedText mt-4 group-hover:translate-x-4 transition-transform duration-500 delay-75">
                {item.location} • {item.fees}
              </p>
            </div>
            
            <div className="text-right flex flex-col items-end">
              <div className="text-xs uppercase tracking-[0.2em] text-warmWhite mb-2">RESULTS</div>
              <div className="font-serif text-3xl text-warmWhite/50 group-hover:text-warmWhite transition-colors">
                {item.results}/10
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
