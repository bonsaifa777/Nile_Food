import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiFacebook, FiInstagram, FiTwitter, FiPhone, FiMail, FiMapPin, FiArrowRight, FiSend, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';

const DEFAULT_FOOTER = {
  brand: { name: 'Nile Food', description: 'Premium food delivery experience. Fresh meals from top restaurants delivered to your door with speed and care.' },
  sections: [
    { title: 'Product', links: [{ label: 'Menu', path: '/menu' }, { label: 'Featured', path: '/menu?category=featured' }, { label: 'Categories', path: '/menu' }, { label: 'Deals', path: '/offers' }] },
    { title: 'Company', links: [{ label: 'About Us', path: '/about' }, { label: 'Experience', path: '/experience' }, { label: 'Gallery', path: '/gallery' }, { label: 'Contact', path: '/contact' }] },
    { title: 'Services', links: [{ label: 'Online Order', path: '/online-ordering' }, { label: 'Reserve Table', path: '/reserve' }, { label: 'Our Locations', path: '/location' }, { label: 'Events', path: '/events' }] },
  ],
  socials: [
    { icon: 'FiFacebook', url: '#', label: 'Facebook', color: 'hover:bg-blue-600' },
    { icon: 'FiInstagram', url: '#', label: 'Instagram', color: 'hover:bg-pink-600' },
    { icon: 'FiTwitter', url: '#', label: 'Twitter', color: 'hover:bg-sky-500' },
  ],
  contact: { phone: '+251 11 234 5678', email: 'info@nilefood.com', address: 'Addis Ababa, Ethiopia' },
  newsletter: { title: 'Stay in the Loop', subtitle: 'Get exclusive deals, new menu alerts, and food stories delivered to your inbox.' }
};

// LINK_GROUPS moved inside component for i18n support

function FloatingParticle({ index }) {
  const duration = 5 + Math.random() * 5;
  const delay = Math.random() * 4;
  const size = 2 + Math.random() * 4;
  const startX = Math.random() * 100;
  const startY = Math.random() * 100;

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${startX}%`,
        top: `${startY}%`,
        background: [ 'rgba(59,130,246,0.3)', 'rgba(168,85,247,0.3)', 'rgba(16,185,129,0.3)', 'rgba(249,115,22,0.3)' ][index % 4],
        boxShadow: `0 0 ${size * 4}px ${['rgba(59,130,246,0.2)', 'rgba(168,85,247,0.2)', 'rgba(16,185,129,0.2)', 'rgba(249,115,22,0.2)'][index % 4]}`,
      }}
      animate={{
        y: [0, -40 - Math.random() * 30, 0],
        x: [0, (Math.random() - 0.5) * 30, 0],
        opacity: [0, 0.8, 0],
        scale: [0, 1.5, 0],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function Blob({ index }) {
  const configs = [
    { top: '15%', left: '8%', size: 350, gradient: 'from-blue-400/8 to-purple-400/4' },
    { top: '55%', right: '5%', size: 420, gradient: 'from-emerald-400/8 to-cyan-400/4' },
    { top: '75%', left: '40%', size: 300, gradient: 'from-orange-400/6 to-pink-400/3' },
    { top: '25%', right: '25%', size: 280, gradient: 'from-indigo-400/8 to-violet-400/4' },
  ];
  const c = configs[index % configs.length];

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        top: c.top, left: c.left, right: c.right,
        width: c.size, height: c.size,
        background: `linear-gradient(135deg, ${c.gradient})`,
        filter: 'blur(80px)',
      }}
      animate={{
        scale: [1, 1.3, 1], rotate: [0, 15, 0], x: [0, 30, 0], y: [0, -30, 0],
      }}
      transition={{ duration: 12 + index * 2, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function MagneticButton({ children, className, as = 'button', ...props }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = e.clientX - rect.left - rect.width / 2;
    const dy = e.clientY - rect.top - rect.height / 2;
    x.set(dx * 0.25);
    y.set(dy * 0.25);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const springX = useSpring(x, { damping: 15, stiffness: 200 });
  const springY = useSpring(y, { damping: 15, stiffness: 200 });

  const Tag = as;
  return (
    <Tag ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} {...props}>
      <motion.span style={{ x: springX, y: springY }} className="block">
        {children}
      </motion.span>
    </Tag>
  );
}

function Logo3D() {
  const ref = useRef(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(y, [0, 1], [15, -15]), { damping: 20, stiffness: 120 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-15, 15]), { damping: 20, stiffness: 120 });

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0.5);
    y.set(0.5);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, perspective: 800 }}
      className="inline-flex items-center gap-3 mb-6 cursor-pointer"
    >
      <Link to="/" className="group inline-flex items-center gap-3">
        <motion.div
          animate={{ rotateY: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 via-purple-500 to-primary-600 flex items-center justify-center shadow-lg"
          style={{ boxShadow: '0 8px 32px rgba(99,102,241,0.3)' }}
        >
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-white font-black text-2xl"
          >
            N
          </motion.span>
        </motion.div>
        <motion.span
          className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300"
          whileHover={{ scale: 1.02 }}
        >
          Nile Food
        </motion.span>
      </Link>
    </motion.div>
  );
}

function NewsletterTilt({ children }) {
  const ref = useRef(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(y, [0, 1], [3, -3]), { damping: 30, stiffness: 200 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-3, 3]), { damping: 30, stiffness: 200 });
  const glareX = useTransform(x, [0, 1], [0, 100]);
  const glareY = useTransform(y, [0, 1], [0, 100]);

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0.5);
    y.set(0.5);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, perspective: 1000 }}
      className="relative overflow-hidden rounded-3xl"
    >
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
        }}
      />
      {children}
    </motion.div>
  );
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const linkItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

function LinkColumn({ section, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
    >
      <motion.h4
        className="text-slate-900 dark:text-white font-bold text-base mb-6 relative inline-block"
      >
        {section.title}
        <motion.div
          className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          whileInView={{ width: '60%' }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + index * 0.15, duration: 0.4 }}
        />
      </motion.h4>
      <motion.nav
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="space-y-3"
      >
        {section.links.map((link, i) => (
          <motion.div key={i} variants={linkItemVariants}>
            <Link
              to={link.path}
              className="group flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors text-sm relative overflow-hidden"
            >
              <motion.span
                className="w-0 h-[1px] bg-primary-500 absolute bottom-0 left-0 group-hover:w-full transition-all duration-300"
              />
              <FiChevronRight size={10} className="text-primary-400 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
              <span>{link.label}</span>
            </Link>
          </motion.div>
        ))}
      </motion.nav>
    </motion.div>
  );
}

export default function Footer() {
  const { t } = useTranslation();
  const LINK_GROUPS = [t('footer.sectionProduct'), t('footer.sectionCompany'), t('footer.sectionServices')];
  const [footer, setFooter] = useState(null);
  const [email, setEmail] = useState('');
  const sectionRef = useRef(null);

  useEffect(() => {
    axios.get('/api/content/footer')
      .then(res => setFooter(res.data.data?.value))
      .catch(() => setFooter(null));
  }, []);

  const defaultFooter = useMemo(() => ({
    ...DEFAULT_FOOTER,
    brand: { ...DEFAULT_FOOTER.brand, name: t('footer.brandName'), description: t('footer.brandDescription') },
    sections: DEFAULT_FOOTER.sections.map(s => ({
      ...s,
      title: t('footer.section' + s.title),
      links: s.links.map(l => ({ ...l, label: t('footer.link' + l.label.replace(/\s+/g, '')) }))
    })),
    socials: DEFAULT_FOOTER.socials.map(s => ({ ...s, label: t('footer.social' + s.label) })),
    newsletter: { ...DEFAULT_FOOTER.newsletter, title: t('footer.newsletterTitle'), subtitle: t('footer.newsletterSubtitle') }
  }), [t]);

  const data = footer || defaultFooter;

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      toast.success(t('footer.subscribed'));
      setEmail('');
    }
  };

  return (
    <footer ref={sectionRef} className="relative bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pointer-events-none" />

      <Blob index={0} />
      <Blob index={1} />
      <Blob index={2} />
      <Blob index={3} />

      {[...Array(16)].map((_, i) => (
        <FloatingParticle key={i} index={i} />
      ))}

      <div className="relative z-10">
        {data.newsletter && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="w-full px-4 sm:px-6 lg:px-8 pt-20 pb-14"
          >
            <NewsletterTilt>
              <div className="relative rounded-3xl p-[1px] overflow-hidden bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 animate-gradient">
                <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-8 lg:p-12">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-purple-500/5 rounded-3xl" />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <motion.h3
                        className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mb-2"
                        whileHover={{ scale: 1.01 }}
                      >
                        {data.newsletter.title}
                      </motion.h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm lg:text-base">{data.newsletter.subtitle}</p>
                    </motion.div>
                    <motion.form
                      onSubmit={handleSubscribe}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="flex gap-3"
                    >
                      <div className="flex-1 relative group">
                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                        <motion.input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t('footer.emailPlaceholder')}
                          required
                          whileFocus={{ scale: 1.01 }}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400 transition-all duration-300"
                        />
                      </div>
                      <MagneticButton as="button" type="submit">
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-shadow text-sm"
                        >
                          {t('footer.subscribe')} <FiSend size={14} />
                        </motion.span>
                      </MagneticButton>
                    </motion.form>
                  </div>
                </div>
              </div>
            </NewsletterTilt>
          </motion.div>
        )}

        <div className="w-full px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              <Logo3D />
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-slate-500 dark:text-slate-400 text-base mb-6 leading-relaxed max-w-sm"
              >
                {data.brand?.description}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex gap-3"
              >
                {(data.socials || []).map((social, index) => {
                  const IconMap = { FiFacebook, FiInstagram, FiTwitter };
                  const Icon = IconMap[social.icon] || FiFacebook;
                  return (
                    <MagneticButton key={index} as="a" href={social.url || '#'} aria-label={social.label}>
                      <motion.span
                        whileHover={{ y: -4, scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`block w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 ${social.color || 'hover:bg-primary-600'} hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-black/10 transition-all duration-300`}
                      >
                        <Icon size={16} />
                      </motion.span>
                    </MagneticButton>
                  );
                })}
              </motion.div>
            </motion.div>

            {LINK_GROUPS.map((title, index) => {
              const section = data.sections?.find(s => s.title === title) || { title, links: [] };
              return <LinkColumn key={title} section={section} index={index} />;
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="relative border-t border-slate-200 dark:border-slate-800"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/10 to-transparent pointer-events-none" />
          <div className="relative w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-wrap items-center gap-6"
            >
              {[
                { icon: FiPhone, href: `tel:${data.contact?.phone?.replace(/\s/g, '')}`, label: data.contact?.phone || '+251 11 234 5678' },
                { icon: FiMail, href: `mailto:${data.contact?.email}`, label: data.contact?.email || 'info@nilefood.com' },
                { icon: FiMapPin, href: null, label: data.contact?.address || 'Addis Ababa, Ethiopia' },
              ].map((item, i) => {
                const Icon = item.icon;
                const content = (
                  <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm group">
                    <Icon size={14} className="group-hover:text-primary-500 transition-colors" />
                    <span className="group-hover:text-primary-500 transition-colors">{item.label}</span>
                  </span>
                );
                return item.href ? (
                  <motion.a
                    key={i}
                    href={item.href}
                    whileHover={{ x: 3 }}
                    className="block"
                  >
                    {content}
                  </motion.a>
                ) : (
                  <motion.span key={i} whileHover={{ x: 3 }} className="block">
                    {content}
                  </motion.span>
                );
              })}
            </motion.div>
            <motion.p
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-slate-400 dark:text-slate-600 text-sm"
            >
              &copy; {new Date().getFullYear()}{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-purple-500 font-semibold">
                {data.brand?.name || t('footer.brandName')}
              </span>
              . {t('footer.rights')}
            </motion.p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
