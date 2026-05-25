import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiSave, FiPlus, FiEdit2, FiTrash2, FiImage, FiStar, FiMessageSquare
} from 'react-icons/fi';

const CONTENT_KEYS = [
  { key: 'hero', label: 'Hero', desc: 'Hero banner, tagline, CTA buttons, images' },
  { key: 'home_how_it_works', label: 'How It Works', desc: 'Steps explaining the ordering process' },
  { key: 'home_cta', label: 'CTA Banner', desc: 'Call-to-action banner with button' },
  { key: 'deal_section', label: 'Deal Section', desc: 'Deal of the week with countdown' },
  { key: 'featured_section', label: 'Featured Section', desc: 'Featured products section heading' },
  { key: 'categories_section', label: 'Categories Section', desc: 'Categories section heading' },
  { key: 'footer', label: 'Footer', desc: 'Footer content, links, socials, newsletter' },
  { key: 'about_page', label: 'About Page', desc: 'About us page - hero, story, stats, values' },
  { key: 'contact_page', label: 'Contact Page', desc: 'Contact page - info, map, contact details' },
  { key: 'reserve_page', label: 'Reserve Page', desc: 'Reserve page - heading, subtitle' },
];

const LISTING_TYPES = [
  { type: 'testimonial', label: 'Testimonials', desc: 'Customer reviews and ratings' },
  { type: 'offer', label: 'Offers', desc: 'Promotional offers and discounts' },
  { type: 'gallery', label: 'Gallery', desc: 'Restaurant and food images' },
  { type: 'event', label: 'Events', desc: 'Events and catering services' },
  { type: 'dining_experience', label: 'Dining Experiences', desc: 'Dining time slots' },
  { type: 'experience_feature', label: 'Experience Features', desc: 'Features on experience page' },
  { type: 'location', label: 'Locations', desc: 'Branch locations' },
  { type: 'online_ordering_step', label: 'Order Steps', desc: 'Steps in online ordering' },
];

const ICON_OPTIONS = [
  'FiShoppingBag', 'FiCreditCard', 'FiTruck', 'FiMonitor', 'FiSmartphone',
  'FiMapPin', 'FiSun', 'FiCoffee', 'FiMoon', 'FiHeart', 'FiAward',
  'FiShield', 'FiUsers', 'FiStar', 'FiGift', 'FiMusic', 'FiCamera',
  'FiCalendar', 'FiSend', 'FiDollarSign'
];

function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tabs.map(tab => (
        <button
          key={tab.key || tab.type}
          onClick={() => onChange(tab)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            (active.key || active.type) === (tab.key || tab.type)
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
              : 'glass-card hover:bg-white/10'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder, rows, required }) {
  const id = label?.replace(/\s+/g, '-').toLowerCase();
  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm mb-1 text-gray-300">{label}</label>}
      {rows ? (
        <textarea
          id={id}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="input-glass"
          required={required}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value || ''}
          onChange={e => onChange(type === 'number' ? e.target.value : e.target.value)}
          placeholder={placeholder}
          className="input-glass"
          required={required}
        />
      )}
    </div>
  );
}

function ArrayEditor({ items, onChange, fields, emptyItem, itemLabel }) {
  const addItem = () => onChange([...items, { ...emptyItem }]);
  const removeItem = i => onChange(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => {
    const updated = items.map((item, idx) =>
      idx === i ? { ...item, [field]: value } : item
    );
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="glass-light rounded-xl p-4 relative">
          <button
            type="button"
            onClick={() => removeItem(i)}
            className="absolute top-2 right-2 p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
          >
            <FiTrash2 size={14} />
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
            {fields.map(field => (
              field.type === 'textarea' ? (
                <div key={field.key} className={field.fullWidth ? 'md:col-span-2' : ''}>
                  <label className="block text-xs mb-1 text-gray-400">{field.label}</label>
                  <textarea
                    value={item[field.key] || ''}
                    onChange={e => updateItem(i, field.key, e.target.value)}
                    className="input-glass text-sm"
                    rows={field.rows || 2}
                    placeholder={field.placeholder}
                  />
                </div>
              ) : field.type === 'select' ? (
                <div key={field.key}>
                  <label className="block text-xs mb-1 text-gray-400">{field.label}</label>
                  <select
                    value={item[field.key] || ''}
                    onChange={e => updateItem(i, field.key, e.target.value)}
                    className="input-glass text-sm"
                  >
                    {field.options.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div key={field.key}>
                  <label className="block text-xs mb-1 text-gray-400">{field.label}</label>
                  <input
                    type={field.type || 'text'}
                    value={item[field.key] || ''}
                    onChange={e => updateItem(i, field.key, e.target.value)}
                    className="input-glass text-sm"
                    placeholder={field.placeholder}
                  />
                </div>
              )
            ))}
          </div>
        </div>
      ))}
      <button type="button" onClick={addItem} className="btn-ghost text-sm flex items-center gap-2">
        <FiPlus size={14} /> Add {itemLabel || 'Item'}
      </button>
    </div>
  );
}

// ─── Hero Section ──────────────────────────────────────────────
function HeroForm({ data, onChange }) {
  const set = (path, value) => {
    const keys = path.split('.');
    const newData = { ...data };
    let obj = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <Input label="Title" value={data?.title} onChange={v => set('title', v)} placeholder="Fastest Delivery & Easy Pickup." />
      <Input label="Subtitle" value={data?.subtitle} onChange={v => set('subtitle', v)} placeholder="Fresh grocery every morning..." rows={2} />
      <Input label="Badge" value={data?.badge} onChange={v => set('badge', v)} placeholder="Bike Delivery" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="CTA Label" value={data?.cta?.label} onChange={v => set('cta.label', v)} placeholder="Order Now" />
        <Input label="CTA Link" value={data?.cta?.link} onChange={v => set('cta.link', v)} placeholder="/menu" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Secondary CTA Label" value={data?.secondaryCta?.label} onChange={v => set('secondaryCta.label', v)} placeholder="Order Process" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Quote Text" value={data?.quote?.text} onChange={v => set('quote.text', v)} placeholder="When you are too lazy to cook..." rows={2} />
        <Input label="Quote Author" value={data?.quote?.author} onChange={v => set('quote.author', v)} placeholder="Chef" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Main Image URL" value={data?.images?.main} onChange={v => set('images.main', v)} placeholder="https://..." />
        <Input label="Chef Image URL" value={data?.images?.chef} onChange={v => set('images.chef', v)} placeholder="https://..." />
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Floating Food Images</h4>
        <ArrayEditor
          items={data?.images?.floating || []}
          onChange={v => set('images.floating', v)}
          fields={[
            { key: 'image', label: 'Image URL', placeholder: 'https://...' },
            { key: 'label', label: 'Label', placeholder: 'Pasta' },
          ]}
          emptyItem={{ image: '', label: '' }}
          itemLabel="Food Image"
        />
      </div>
    </div>
  );
}

// ─── How It Works ──────────────────────────────────────────────
function HowItWorksForm({ data, onChange }) {
  const set = (path, value) => {
    const keys = path.split('.');
    const newData = { ...data };
    let obj = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <Input label="Section Title" value={data?.title} onChange={v => set('title', v)} placeholder="How It Works" />
      <Input label="Highlight Word" value={data?.highlight} onChange={v => set('highlight', v)} placeholder="Works" />
      <Input label="Subtitle" value={data?.subtitle} onChange={v => set('subtitle', v)} placeholder="Get your favorite food in 3 easy steps" rows={2} />

      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Steps</h4>
        <ArrayEditor
          items={data?.steps || []}
          onChange={v => set('steps', v)}
          fields={[
            { key: 'icon', label: 'Icon', type: 'select', options: ICON_OPTIONS.map(i => ({ value: i, label: i.replace('Fi', '') })) },
            { key: 'title', label: 'Title', placeholder: 'Browse & Choose' },
            { key: 'desc', label: 'Description', placeholder: 'Explore our curated menu...', type: 'textarea' },
          ]}
          emptyItem={{ icon: 'FiShoppingBag', title: '', desc: '' }}
          itemLabel="Step"
        />
      </div>
    </div>
  );
}

// ─── CTA Banner ────────────────────────────────────────────────
function CTAForm({ data, onChange }) {
  const set = (path, value) => {
    const keys = path.split('.');
    const newData = { ...data };
    let obj = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <Input label="Title" value={data?.title} onChange={v => set('title', v)} placeholder="Get 20% Off Your First Order" />
      <Input label="Subtitle" value={data?.subtitle} onChange={v => set('subtitle', v)} placeholder="Sign up today and enjoy exclusive deals..." rows={2} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Button Label" value={data?.button?.label} onChange={v => set('button.label', v)} placeholder="Sign Up Now" />
        <Input label="Button Link" value={data?.button?.link} onChange={v => set('button.link', v)} placeholder="/register" />
      </div>
    </div>
  );
}

// ─── Deal Section ──────────────────────────────────────────────
function DealForm({ data, onChange }) {
  const set = (path, value) => {
    const keys = path.split('.');
    const newData = { ...data };
    let obj = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <Input label="Title" value={data?.title} onChange={v => set('title', v)} placeholder="Deal Of the Week" />
      <Input label="Highlight Word" value={data?.highlight} onChange={v => set('highlight', v)} placeholder="Of the Week" />
      <Input label="Subtitle" value={data?.subtitle} onChange={v => set('subtitle', v)} placeholder="Limited time offers!" rows={2} />

      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Countdown Timer</h4>
        <div className="grid grid-cols-4 gap-3">
          <Input label="Days" value={data?.countdown?.days} onChange={v => set('countdown.days', v)} placeholder="00" />
          <Input label="Hours" value={data?.countdown?.hours} onChange={v => set('countdown.hours', v)} placeholder="00" />
          <Input label="Minutes" value={data?.countdown?.minutes} onChange={v => set('countdown.minutes', v)} placeholder="00" />
          <Input label="Seconds" value={data?.countdown?.seconds} onChange={v => set('countdown.seconds', v)} placeholder="00" />
        </div>
      </div>
    </div>
  );
}

// ─── Section Headings ──────────────────────────────────────────
function HeadingsForm({ featuredData, categoriesData, onFeaturedChange, onCategoriesChange }) {
  return (
    <div className="space-y-8">
      <div className="glass-light rounded-xl p-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-4">Featured Products Section</h4>
        <div className="grid grid-cols-1 gap-4">
          <Input label="Title" value={featuredData?.title} onChange={v => onFeaturedChange({ ...featuredData, title: v })} placeholder="Our Featured Products" />
          <Input label="Highlight Word" value={featuredData?.highlight} onChange={v => onFeaturedChange({ ...featuredData, highlight: v })} placeholder="Featured" />
          <Input label="Subtitle" value={featuredData?.subtitle} onChange={v => onFeaturedChange({ ...featuredData, subtitle: v })} placeholder="Delicious food picks just for you" rows={2} />
        </div>
      </div>

      <div className="glass-light rounded-xl p-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-4">Categories Section</h4>
        <div className="grid grid-cols-1 gap-4">
          <Input label="Title" value={categoriesData?.title} onChange={v => onCategoriesChange({ ...categoriesData, title: v })} placeholder="Explore Categories" />
          <Input label="Highlight Word" value={categoriesData?.highlight} onChange={v => onCategoriesChange({ ...categoriesData, highlight: v })} placeholder="Categories" />
          <Input label="Subtitle" value={categoriesData?.subtitle} onChange={v => onCategoriesChange({ ...categoriesData, subtitle: v })} placeholder="Choose from our most popular food categories" rows={2} />
        </div>
      </div>
    </div>
  );
}

// ─── Footer ────────────────────────────────────────────────────
function FooterForm({ data, onChange }) {
  const set = (path, value) => {
    const keys = path.split('.');
    const newData = { ...data };
    let obj = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <div className="glass-light rounded-xl p-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-4">Brand</h4>
        <div className="grid grid-cols-1 gap-4">
          <Input label="Brand Name" value={data?.brand?.name} onChange={v => set('brand.name', v)} placeholder="Nile Food" />
          <Input label="Description" value={data?.brand?.description} onChange={v => set('brand.description', v)} placeholder="Premium food delivery experience..." rows={3} />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Footer Link Sections</h4>
        <ArrayEditor
          items={data?.sections || []}
          onChange={v => set('sections', v)}
          fields={[
            { key: 'title', label: 'Section Title', placeholder: 'Product' },
          ]}
          emptyItem={{ title: '', links: [{ label: '', path: '' }] }}
          itemLabel="Section"
        />
        {data?.sections?.map((section, si) => (
          <div key={si} className="ml-6 mb-4 p-3 glass-light rounded-xl">
            <p className="text-xs text-gray-400 mb-2">Links for: <span className="text-white font-medium">{section.title || 'Untitled'}</span></p>
            <ArrayEditor
              items={section.links || []}
              onChange={v => {
                const updated = [...(data?.sections || [])];
                updated[si] = { ...updated[si], links: v };
                onChange({ ...data, sections: updated });
              }}
              fields={[
                { key: 'label', label: 'Label', placeholder: 'Menu' },
                { key: 'path', label: 'Path', placeholder: '/menu' },
              ]}
              emptyItem={{ label: '', path: '' }}
              itemLabel="Link"
            />
          </div>
        ))}
      </div>

      <div className="glass-light rounded-xl p-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-4">Social Links</h4>
        <ArrayEditor
          items={data?.socials || []}
          onChange={v => set('socials', v)}
          fields={[
            { key: 'icon', label: 'Icon Name', type: 'select', options: [
              { value: 'FiFacebook', label: 'Facebook' },
              { value: 'FiInstagram', label: 'Instagram' },
              { value: 'FiTwitter', label: 'Twitter' },
            ]},
            { key: 'label', label: 'Label', placeholder: 'Facebook' },
            { key: 'url', label: 'URL', placeholder: 'https://facebook.com/...' },
          ]}
          emptyItem={{ icon: 'FiFacebook', label: '', url: '' }}
          itemLabel="Social Link"
        />
      </div>

      <div className="glass-light rounded-xl p-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-4">Contact Info</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Phone" value={data?.contact?.phone} onChange={v => set('contact.phone', v)} placeholder="+251 11 234 5678" />
          <Input label="Email" value={data?.contact?.email} onChange={v => set('contact.email', v)} placeholder="info@nilefood.com" />
          <Input label="Address" value={data?.contact?.address} onChange={v => set('contact.address', v)} placeholder="Addis Ababa, Ethiopia" />
        </div>
      </div>

      <div className="glass-light rounded-xl p-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-4">Newsletter Section</h4>
        <div className="grid grid-cols-1 gap-4">
          <Input label="Title" value={data?.newsletter?.title} onChange={v => set('newsletter.title', v)} placeholder="Stay in the Loop" />
          <Input label="Subtitle" value={data?.newsletter?.subtitle} onChange={v => set('newsletter.subtitle', v)} placeholder="Get exclusive deals..." rows={2} />
        </div>
      </div>
    </div>
  );
}

// ─── About Page ────────────────────────────────────────────────
function AboutPageForm({ data, onChange }) {
  const set = (path, value) => {
    const keys = path.split('.');
    const newData = { ...data };
    let obj = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <Input label="Page Title" value={data?.title} onChange={v => set('title', v)} placeholder="About Nile Food" />
      <Input label="Page Subtitle" value={data?.subtitle} onChange={v => set('subtitle', v)} placeholder="Discover our story..." rows={2} />

      <div className="glass-light rounded-xl p-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-4">Story Section</h4>
        <div className="grid grid-cols-1 gap-4">
          <Input label="Story Text" value={data?.story?.text} onChange={v => set('story.text', v)} placeholder="Founded in 2010..." rows={4} />
          <Input label="Story Image URL" value={data?.story?.image} onChange={v => set('story.image', v)} placeholder="https://..." />
          <div className="grid grid-cols-2 gap-4">
            <Input label="CTA Label" value={data?.story?.ctaLabel} onChange={v => set('story.ctaLabel', v)} placeholder="Explore Our Menu" />
            <Input label="CTA Link" value={data?.story?.ctaLink} onChange={v => set('story.ctaLink', v)} placeholder="/menu" />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Statistics</h4>
        <ArrayEditor
          items={data?.stats || []}
          onChange={v => set('stats', v)}
          fields={[
            { key: 'value', label: 'Value', placeholder: '15+' },
            { key: 'label', label: 'Label', placeholder: 'Years of Excellence' },
          ]}
          emptyItem={{ value: '', label: '' }}
          itemLabel="Stat"
        />
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Core Values</h4>
        <ArrayEditor
          items={data?.values || []}
          onChange={v => set('values', v)}
          fields={[
            { key: 'icon', label: 'Icon (emoji)', placeholder: '🌿' },
            { key: 'title', label: 'Title', placeholder: 'Quality Ingredients' },
            { key: 'desc', label: 'Description', type: 'textarea', placeholder: 'We source the freshest...' },
          ]}
          emptyItem={{ icon: '', title: '', desc: '' }}
          itemLabel="Value"
        />
      </div>
    </div>
  );
}

// ─── Contact Page ──────────────────────────────────────────────
function ContactPageForm({ data, onChange }) {
  const set = (path, value) => {
    const keys = path.split('.');
    const newData = { ...data };
    let obj = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <Input label="Page Title" value={data?.title} onChange={v => set('title', v)} placeholder="Contact Us" />
      <Input label="Page Subtitle" value={data?.subtitle} onChange={v => set('subtitle', v)} placeholder="We'd love to hear from you..." rows={2} />

      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Contact Information</h4>
        <ArrayEditor
          items={data?.contactInfo || []}
          onChange={v => set('contactInfo', v)}
          fields={[
            { key: 'icon', label: 'Icon (emoji)', placeholder: '📍' },
            { key: 'label', label: 'Label', placeholder: 'Address' },
            { key: 'value', label: 'Value', placeholder: '123 Nile Street...' },
          ]}
          emptyItem={{ icon: '', label: '', value: '' }}
          itemLabel="Contact Info"
        />
      </div>

      <Input label="Map Embed URL" value={data?.mapEmbedUrl} onChange={v => set('mapEmbedUrl', v)} placeholder="https://www.google.com/maps/embed?pb=..." rows={2} />
    </div>
  );
}

// ─── Reserve Page ──────────────────────────────────────────────
function ReservePageForm({ data, onChange }) {
  const set = (path, value) => {
    const keys = path.split('.');
    const newData = { ...data };
    let obj = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    onChange(newData);
  };

  const addGalleryItem = () => {
    const current = data?.gallery || [];
    set('gallery', [...current, { src: '', alt: '', label: '' }]);
  };

  const removeGalleryItem = (idx) => {
    const current = data?.gallery || [];
    set('gallery', current.filter((_, i) => i !== idx));
  };

  const updateGalleryItem = (idx, field, value) => {
    const current = data?.gallery || [];
    set('gallery', current.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const addReview = () => {
    const current = data?.reviews || [];
    set('reviews', [...current, { name: '', avatar: '', rating: 5, date: '', text: '' }]);
  };

  const removeReview = (idx) => {
    const current = data?.reviews || [];
    set('reviews', current.filter((_, i) => i !== idx));
  };

  const updateReview = (idx, field, value) => {
    const current = data?.reviews || [];
    set('reviews', current.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const addSimilar = () => {
    const current = data?.similarExperiences || [];
    set('similarExperiences', [...current, { title: '', subtitle: '', price: '', rating: 4.5, badge: 'Featured', available: true, image: '', features: [] }]);
  };

  const removeSimilar = (idx) => {
    const current = data?.similarExperiences || [];
    set('similarExperiences', current.filter((_, i) => i !== idx));
  };

  const updateSimilar = (idx, field, value) => {
    const current = data?.similarExperiences || [];
    set('similarExperiences', current.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const addAmenity = () => {
    const current = data?.amenities || [];
    set('amenities', [...current, { label: '' }]);
  };

  const removeAmenity = (idx) => {
    const current = data?.amenities || [];
    set('amenities', current.filter((_, i) => i !== idx));
  };

  const updateAmenity = (idx, value) => {
    const current = data?.amenities || [];
    set('amenities', current.map((item, i) => i === idx ? { ...item, label: value } : item));
  };

  const addFeature = (idx) => {
    const current = data?.similarExperiences || [];
    const item = current[idx];
    if (!item) return;
    const features = item.features || [];
    set(`similarExperiences.${idx}.features`, [...features, '']);
  };

  const removeFeature = (sIdx, fIdx) => {
    const current = data?.similarExperiences || [];
    const item = current[sIdx];
    if (!item) return;
    const features = item.features || [];
    set(`similarExperiences.${sIdx}.features`, features.filter((_, i) => i !== fIdx));
  };

  const updateFeature = (sIdx, fIdx, value) => {
    const current = data?.similarExperiences || [];
    const item = current[sIdx];
    if (!item) return;
    const features = item.features || [];
    set(`similarExperiences.${sIdx}.features`, features.map((f, i) => i === fIdx ? value : f));
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-slate-700/50 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none";
  const sectionClass = "p-5 rounded-2xl bg-white/30 dark:bg-slate-800/30 border border-gray-200/50 dark:border-slate-700/30 space-y-4";
  const labelClass = "text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block";
  const btnAddClass = "flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-xs font-semibold shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all";
  const btnRemoveClass = "px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-all";

  return (
    <div className="space-y-8">
      <div className={sectionClass}>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">Page Header</h3>
        <Input label="Page Title" value={data?.title} onChange={v => set('title', v)} placeholder="Reserve a Table" />
        <Input label="Page Subtitle" value={data?.subtitle} onChange={v => set('subtitle', v)} placeholder="Book your dining experience at Nile Food" rows={2} />
        <Input label="Description / Quote" value={data?.description} onChange={v => set('description', v)} placeholder="A luxurious description of the experience..." rows={3} />
      </div>

      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">Gallery Images</h3>
          <button type="button" onClick={addGalleryItem} className={btnAddClass}>Add Image</button>
        </div>
        {(data?.gallery || []).length === 0 && <p className="text-xs text-gray-500">No gallery images. Click "Add Image" to start.</p>}
        {(data?.gallery || []).map((item, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-gray-200/50 dark:border-slate-700/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Image #{idx + 1}</span>
              <button type="button" onClick={() => removeGalleryItem(idx)} className={btnRemoveClass}>Remove</button>
            </div>
            <Input label="Image URL" value={item.src} onChange={v => updateGalleryItem(idx, 'src', v)} placeholder="https://images.unsplash.com/..." />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Alt Text" value={item.alt} onChange={v => updateGalleryItem(idx, 'alt', v)} placeholder="Description of image" />
              <Input label="Label" value={item.label} onChange={v => updateGalleryItem(idx, 'label', v)} placeholder="Grand Dining Hall" />
            </div>
          </div>
        ))}
      </div>

      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">Room Element Images (Detail Shots)</h3>
          <button type="button" onClick={() => { const cur = data?.elementImages || []; set('elementImages', [...cur, { src: '', alt: '', label: '' }]); }} className={btnAddClass}>Add Image</button>
        </div>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 -mt-2">These appear below the hero image showing room details (bed, bath, view, etc.)</p>
        {(data?.elementImages || []).length === 0 && <p className="text-xs text-gray-500 mt-2">No element images yet.</p>}
        {(data?.elementImages || []).map((item, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-gray-200/50 dark:border-slate-700/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Element #{idx + 1}</span>
              <button type="button" onClick={() => { const cur = data?.elementImages || []; set('elementImages', cur.filter((_, i) => i !== idx)); }} className={btnRemoveClass}>Remove</button>
            </div>
            <Input label="Image URL" value={item.src} onChange={v => { const cur = data?.elementImages || []; set('elementImages', cur.map((e, i) => i === idx ? { ...e, src: v } : e)); }} placeholder="https://images.unsplash.com/..." />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Label" value={item.label} onChange={v => { const cur = data?.elementImages || []; set('elementImages', cur.map((e, i) => i === idx ? { ...e, label: v } : e)); }} placeholder="Master Bedroom" />
              <Input label="Alt Text" value={item.alt} onChange={v => { const cur = data?.elementImages || []; set('elementImages', cur.map((e, i) => i === idx ? { ...e, alt: v } : e)); }} placeholder="Luxury bedroom" />
            </div>
          </div>
        ))}
      </div>

      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">Guest Reviews</h3>
          <button type="button" onClick={addReview} className={btnAddClass}>Add Review</button>
        </div>
        {(data?.reviews || []).length === 0 && <p className="text-xs text-gray-500">No reviews yet.</p>}
        {(data?.reviews || []).map((item, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-gray-200/50 dark:border-slate-700/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Review #{idx + 1}</span>
              <button type="button" onClick={() => removeReview(idx)} className={btnRemoveClass}>Remove</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Name" value={item.name} onChange={v => updateReview(idx, 'name', v)} placeholder="Sarah M." />
              <Input label="Avatar Initials" value={item.avatar} onChange={v => updateReview(idx, 'avatar', v)} placeholder="SM" />
              <Input label="Rating (1-5)" value={item.rating} onChange={v => updateReview(idx, 'rating', Number(v))} placeholder="5" type="number" />
              <Input label="Date Text" value={item.date} onChange={v => updateReview(idx, 'date', v)} placeholder="2 weeks ago" />
            </div>
            <Input label="Review Text" value={item.text} onChange={v => updateReview(idx, 'text', v)} placeholder="Amazing experience..." rows={2} />
          </div>
        ))}
      </div>

      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">Similar Experiences</h3>
          <button type="button" onClick={addSimilar} className={btnAddClass}>Add Experience</button>
        </div>
        {(data?.similarExperiences || []).length === 0 && <p className="text-xs text-gray-500">No similar experiences yet.</p>}
        {(data?.similarExperiences || []).map((item, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-gray-200/50 dark:border-slate-700/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Experience #{idx + 1}</span>
              <button type="button" onClick={() => removeSimilar(idx)} className={btnRemoveClass}>Remove</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Title" value={item.title} onChange={v => updateSimilar(idx, 'title', v)} placeholder="Sunset Dinner Cruise" />
              <Input label="Subtitle" value={item.subtitle} onChange={v => updateSimilar(idx, 'subtitle', v)} placeholder="Nile River Experience" />
              <Input label="Price" value={item.price} onChange={v => updateSimilar(idx, 'price', v)} placeholder="ETB 4,500" />
              <Input label="Rating" value={item.rating} onChange={v => updateSimilar(idx, 'rating', Number(v))} placeholder="4.9" type="number" />
              <Input label="Badge" value={item.badge} onChange={v => updateSimilar(idx, 'badge', v)} placeholder="Hot Deal" />
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" checked={item.available || false} onChange={e => updateSimilar(idx, 'available', e.target.checked)} className="rounded" />
                Available
              </label>
            </div>
            <Input label="Image URL" value={item.image} onChange={v => updateSimilar(idx, 'image', v)} placeholder="https://images.unsplash.com/..." />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">Features</span>
                <button type="button" onClick={() => addFeature(idx)} className="text-xs text-primary-400 hover:text-primary-300">+ Add Feature</button>
              </div>
              {(item.features || []).map((f, fi) => (
                <div key={fi} className="flex items-center gap-2 mb-1.5">
                  <input
                    value={f}
                    onChange={e => updateFeature(idx, fi, e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white/40 dark:bg-white/5 border border-gray-200 dark:border-slate-700/50 text-xs text-gray-900 dark:text-white focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 outline-none"
                    placeholder="5-Course Meal"
                  />
                  <button type="button" onClick={() => removeFeature(idx, fi)} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">Amenities</h3>
          <button type="button" onClick={addAmenity} className={btnAddClass}>Add Amenity</button>
        </div>
        {(data?.amenities || []).length === 0 && <p className="text-xs text-gray-500">No amenities yet.</p>}
        <div className="grid grid-cols-2 gap-3">
          {(data?.amenities || []).map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-gray-200/50 dark:border-slate-700/30">
              <input
                value={item.label || ''}
                onChange={e => updateAmenity(idx, e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                placeholder="Free High-Speed Wi-Fi"
              />
              <button type="button" onClick={() => removeAmenity(idx)} className="text-red-400 hover:text-red-300 shrink-0">
                <FiTrash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Listing Manager ───────────────────────────────────────────
const LISTING_FIELDS = {
  testimonial: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'role', label: 'Role', type: 'text' },
    { key: 'text', label: 'Review Text', type: 'textarea', fullWidth: true },
    { key: 'rating', label: 'Rating (1-5)', type: 'number' },
    { key: 'initial', label: 'Initial', type: 'text' },
  ],
  offer: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'discount', label: 'Discount Text', type: 'text' },
    { key: 'desc', label: 'Description', type: 'textarea', fullWidth: true },
    { key: 'valid', label: 'Validity Info', type: 'text' },
    { key: 'color', label: 'Gradient Color', type: 'text' },
  ],
  gallery: [
    { key: 'src', label: 'Image URL', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'title', label: 'Title', type: 'text' },
  ],
  event: [
    { key: 'icon', label: 'Icon', type: 'select', options: ICON_OPTIONS.map(i => ({ value: i, label: i.replace('Fi', '') })) },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'desc', label: 'Description', type: 'textarea', fullWidth: true },
  ],
  dining_experience: [
    { key: 'icon', label: 'Icon', type: 'select', options: ICON_OPTIONS.map(i => ({ value: i, label: i.replace('Fi', '') })) },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'time', label: 'Time', type: 'text' },
    { key: 'desc', label: 'Description', type: 'textarea', fullWidth: true },
    { key: 'image', label: 'Image URL', type: 'text' },
  ],
  experience_feature: [
    { key: 'icon', label: 'Icon', type: 'select', options: ICON_OPTIONS.map(i => ({ value: i, label: i.replace('Fi', '') })) },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'desc', label: 'Description', type: 'textarea', fullWidth: true },
  ],
  room: [
    { key: 'name', label: 'Room Name', type: 'text' },
    { key: 'capacity', label: 'Capacity', type: 'text' },
    { key: 'price', label: 'Price', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea', fullWidth: true },
    { key: 'image', label: 'Image URL', type: 'text' },
    { key: 'amenities', label: 'Amenities (comma separated)', type: 'text' },
    { key: 'featured', label: 'Featured?', type: 'checkbox' },
  ],
  location: [
    { key: 'name', label: 'Location Name', type: 'text' },
    { key: 'address', label: 'Address', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'hours', label: 'Business Hours', type: 'text' },
    { key: 'latitude', label: 'Latitude', type: 'number' },
    { key: 'longitude', label: 'Longitude', type: 'number' },
  ],
  package: [
    { key: 'name', label: 'Package Name', type: 'text' },
    { key: 'price', label: 'Price', type: 'text' },
    { key: 'items', label: 'Items (comma separated)', type: 'text' },
    { key: 'popular', label: 'Popular?', type: 'checkbox' },
  ],
  online_ordering_step: [
    { key: 'icon', label: 'Icon', type: 'select', options: ICON_OPTIONS.map(i => ({ value: i, label: i.replace('Fi', '') })) },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'desc', label: 'Description', type: 'textarea', fullWidth: true },
  ],
};

function ListingModal({ type, listing, onClose, onSaved }) {
  const [data, setData] = useState(listing?.data || {});
  const [order, setOrder] = useState(listing?.order || 0);
  const [isActive, setIsActive] = useState(listing?.isActive !== false);
  const [saving, setSaving] = useState(false);
  const isEdit = !!listing;

  const fields = LISTING_FIELDS[type] || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        data,
        order: Number(order),
        isActive,
      };

      if (isEdit) {
        await axios.put(`/api/listings/${listing._id}`, payload);
        toast.success('Listing updated');
      } else {
        await axios.post(`/api/listings/${type}`, payload);
        toast.success('Listing created');
      }
      onSaved();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass-card w-full max-w-lg max-h-[80vh] overflow-y-auto"
      >
        <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit' : 'Add'} {type.replace(/_/g, ' ')}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(field => {
            const val = data[field.key];
            const handleChange = (v) => {
              if (field.key === 'amenities' || field.key === 'items') {
                setData({ ...data, [field.key]: v.split(',').map(s => s.trim()).filter(Boolean) });
              } else if (field.type === 'checkbox') {
                setData({ ...data, [field.key]: v });
              } else {
                setData({ ...data, [field.key]: v });
              }
            };

            if (field.type === 'checkbox') {
              return (
                <label key={field.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!val}
                    onChange={e => handleChange(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">{field.label}</span>
                </label>
              );
            }

            const displayVal = Array.isArray(val) ? val.join(', ') : val;

            return field.type === 'select' ? (
              <div key={field.key}>
                <label className="block text-sm mb-1 text-gray-300">{field.label}</label>
                <select
                  value={displayVal || ''}
                  onChange={e => handleChange(e.target.value)}
                  className="input-glass"
                >
                  {field.options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            ) : field.type === 'textarea' ? (
              <div key={field.key}>
                <label className="block text-sm mb-1 text-gray-300">{field.label}</label>
                <textarea
                  value={displayVal || ''}
                  onChange={e => handleChange(e.target.value)}
                  className="input-glass"
                  rows={3}
                />
              </div>
            ) : (
              <div key={field.key}>
                <label className="block text-sm mb-1 text-gray-300">{field.label}</label>
                <input
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={displayVal || ''}
                  onChange={e => handleChange(field.type === 'number' ? Number(e.target.value) : e.target.value)}
                  className="input-glass"
                />
              </div>
            );
          })}

          <div className="grid grid-cols-2 gap-4">
            <Input label="Order" type="number" value={order} onChange={setOrder} placeholder="0" />
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">Active</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-50">
              {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ListingTable({ type }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/listings/${type}?all=true`);
      setListings(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`/api/listings/${id}`);
      toast.success('Deleted');
      fetchListings();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const openEdit = (listing) => {
    setEditing(listing);
    setShowModal(true);
  };

  const renderCard = (listing) => {
    const d = listing.data || {};

    if (type === 'testimonial') {
      return (
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
            {d.initial || d.name?.charAt(0) || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-900 dark:text-white">{d.name}</span>
              <span className="text-xs text-gray-400">— {d.role || 'Customer'}</span>
            </div>
            <div className="flex gap-0.5 mb-2">
              {[...Array(d.rating || 5)].map((_, si) => (
                <FiStar key={si} className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 italic">
              &quot;{d.text}&quot;
            </p>
          </div>
        </div>
      );
    }

    if (type === 'offer') {
      const gradients = ['from-rose-500 to-pink-600', 'from-amber-500 to-orange-600', 'from-emerald-500 to-teal-600', 'from-blue-500 to-indigo-600', 'from-violet-500 to-purple-600'];
      const g = gradients[listing.order % gradients.length];
      return (
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${g} flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0`}>
            {d.discount?.replace(/[^0-9]/g, '').slice(0, 2) || '%'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-900 dark:text-white">{d.title}</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 text-xs font-semibold">{d.discount}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{d.desc}</p>
            {d.valid && <p className="text-xs text-gray-400 mt-1">⏱ {d.valid}</p>}
          </div>
        </div>
      );
    }

    if (type === 'gallery') {
      return (
        <div className="flex items-start gap-4">
          <div className="w-20 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700 shrink-0 shadow-md">
            {d.src ? (
              <img src={d.src} alt={d.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400"><FiImage size={20} /></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-900 dark:text-white">{d.title || 'Untitled'}</div>
            {d.category && <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 font-medium">{d.category}</span>}
          </div>
        </div>
      );
    }

    if (type === 'event') {
      const icons = { FiAward: '🏆', FiMusic: '🎵', FiCamera: '📸', FiCalendar: '📅', FiUsers: '👥', FiStar: '⭐', FiGift: '🎁', FiHeart: '❤️' };
      return (
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg shrink-0">
            {icons[d.icon] || '📌'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-900 dark:text-white mb-1">{d.title}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{d.desc}</p>
          </div>
        </div>
      );
    }

    if (type === 'dining_experience') {
      return (
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl shadow-lg shrink-0">
            🍽️
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-900 dark:text-white">{d.title}</span>
              {d.time && <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-xs font-semibold">⏰ {d.time}</span>}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{d.desc}</p>
            {d.image && (
              <div className="mt-2 w-24 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700 shadow-sm">
                <img src={d.image} alt={d.title} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      );
    }

    if (type === 'experience_feature') {
      const icons = { FiAward: '🏆', FiStar: '⭐', FiShield: '🛡️', FiUsers: '👥', FiHeart: '❤️', FiSun: '☀️', FiCoffee: '☕', FiMoon: '🌙' };
      return (
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl shadow-lg shrink-0">
            {icons[d.icon] || '✨'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-900 dark:text-white mb-1">{d.title}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{d.desc}</p>
          </div>
        </div>
      );
    }

    if (type === 'room') {
      return (
        <div className="flex items-start gap-4">
          {d.image ? (
            <div className="w-20 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700 shrink-0 shadow-md">
              <img src={d.image} alt={d.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-20 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-lg shadow-md shrink-0">🏠</div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-900 dark:text-white">{d.name}</span>
              {d.featured && <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-xs font-semibold">Featured</span>}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              {d.capacity && <span>👤 {d.capacity}</span>}
              {d.price && <span className="font-semibold text-emerald-500">{d.price}</span>}
            </div>
            {d.amenities && (
              <div className="flex gap-1 mt-1 flex-wrap">
                {d.amenities.split(',').slice(0, 3).map((a, ai) => (
                  <span key={ai} className="text-xs px-2 py-0.5 rounded-full bg-white/50 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400">{a.trim()}</span>
                ))}
                {d.amenities.split(',').length > 3 && <span className="text-xs text-gray-400">+{d.amenities.split(',').length - 3}</span>}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (type === 'location') {
      return (
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white text-xl shadow-lg shrink-0">
            📍
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-900 dark:text-white mb-1">{d.name}</div>
            <div className="space-y-0.5 text-sm text-gray-500 dark:text-gray-400">
              {d.address && <p>📍 {d.address}</p>}
              {d.phone && <p>📞 {d.phone}</p>}
              {d.hours && <p>🕐 {d.hours}</p>}
            </div>
          </div>
        </div>
      );
    }

    if (type === 'package') {
      return (
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0">
              {d.price?.replace(/[^0-9]/g, '').slice(0, 3) || '$'}
            </div>
            {d.popular && <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-lg">POPULAR</span>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-900 dark:text-white">{d.name}</span>
              <span className="text-sm font-semibold text-emerald-500">{d.price}</span>
            </div>
            {d.items && (
              <div className="flex gap-1 flex-wrap">
                {d.items.split(',').map((item, ai) => (
                  <span key={ai} className="text-xs px-2 py-0.5 rounded-full bg-white/50 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400">{item.trim()}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (type === 'online_ordering_step') {
      const icons = { FiShoppingBag: '🛍️', FiCreditCard: '💳', FiTruck: '🚚', FiMonitor: '🖥️', FiSmartphone: '📱', FiMapPin: '📍', FiSun: '☀️', FiCoffee: '☕', FiMoon: '🌙' };
      return (
        <div className="flex items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-xl shadow-lg shrink-0">
              {icons[d.icon] || '📋'}
            </div>
            <div className="text-2xl font-black text-indigo-500/30">{listing.order}</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-900 dark:text-white mb-1">{d.title}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{d.desc}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <span className="font-bold text-gray-900 dark:text-white">{d.title || d.name || 'Untitled'}</span>
      </div>
    );
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">{type.replace(/_/g, ' ')}</h3>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus size={18} /> Add {type === 'testimonial' ? 'Testimonial' : type.replace(/_/g, ' ')}
        </button>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <FiImage size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-1">No {type.replace(/_/g, ' ')} yet</p>
          <p className="text-sm text-gray-400">Click the button above to add your first {type.replace(/_/g, ' ').slice(0, -1) || 'item'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings.map((item, i) => (
            <motion.div
              key={item._id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="group relative bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200 dark:border-slate-700/50 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-lg">#{item.order}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    item.isActive
                      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20'
                      : 'bg-red-500/15 text-red-400 border border-red-500/20'
                  }`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-emerald-500' : 'bg-red-400'} mr-1.5`} />
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {renderCard(item)}
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-slate-700/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button onClick={() => openEdit(item)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 text-sm font-medium transition-all">
                    <FiEdit2 size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-all">
                    <FiTrash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <ListingModal
            type={type}
            listing={editing}
            onClose={() => { setShowModal(false); setEditing(null); }}
            onSaved={() => { setShowModal(false); setEditing(null); fetchListings(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Customer Reviews (from orders) ────────────────────────────
function CustomerReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/listings/testimonial/real');
      setReviews(res.data.data || []);
    } catch {
      toast.error('Failed to load customer reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div>
      <p className="text-sm text-gray-400 mb-4">
        These are real reviews left by customers on their orders. They appear automatically on the homepage testimonials section.
      </p>
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FiMessageSquare size={48} className="mx-auto mb-4 opacity-30" />
          No customer reviews yet. Reviews appear once customers rate and review their orders.
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((item, i) => {
            const d = item.data;
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-light rounded-xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-sm">
                      {d.initial}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{d.name}</div>
                      <div className="text-xs text-gray-400">{d.role}</div>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(d.rating || 5)].map((_, si) => (
                      <FiStar key={si} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-300 italic leading-relaxed">&quot;{d.text}&quot;</p>
                <div className="mt-2 text-xs text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Content Page ─────────────────────────────────────────
export default function Content() {
  const [activeTab, setActiveTab] = useState('sections');
  const [activeContent, setActiveContent] = useState(CONTENT_KEYS[0]);
  const [activeListing, setActiveListing] = useState(LISTING_TYPES[0]);

  const [contentData, setContentData] = useState({});
  const [loading, setLoading] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchContent = async (contentKey) => {
    setLoading(prev => ({ ...prev, [contentKey]: true }));
    try {
      const res = await axios.get(`/api/content/${contentKey}`);
      setContentData(prev => ({ ...prev, [contentKey]: res.data.data?.value || {} }));
    } catch {
      setContentData(prev => ({ ...prev, [contentKey]: {} }));
    } finally {
      setLoading(prev => ({ ...prev, [contentKey]: false }));
    }
  };

  useEffect(() => {
    if (activeTab === 'sections') {
      CONTENT_KEYS.forEach(ck => fetchContent(ck.key));
    }
  }, [activeTab]);

  const handleSaveContent = async (contentKey) => {
    setSaving(true);
    try {
      await axios.put(`/api/content/${contentKey}`, { value: contentData[contentKey] });
      toast.success(`${CONTENT_KEYS.find(c => c.key === contentKey)?.label} saved`);
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const renderContentForm = () => {
    const key = activeContent.key;
    const data = contentData[key] || {};
    const isLoading = loading[key];

    if (isLoading) {
      return (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-white/5 rounded-xl" />
          ))}
        </div>
      );
    }

    const formProps = { data, onChange: v => setContentData(prev => ({ ...prev, [key]: v })) };

    return (
      <div className="space-y-6">
        {key === 'hero' && <HeroForm {...formProps} />}
        {key === 'home_how_it_works' && <HowItWorksForm {...formProps} />}
        {key === 'home_cta' && <CTAForm {...formProps} />}
        {key === 'deal_section' && <DealForm {...formProps} />}
        {key === 'featured_section' && (
          <HeadingsForm
            featuredData={data}
            categoriesData={contentData['categories_section'] || {}}
            onFeaturedChange={v => setContentData(prev => ({ ...prev, [key]: v }))}
            onCategoriesChange={v => setContentData(prev => ({ ...prev, categories_section: v }))}
          />
        )}
        {key === 'categories_section' && (
          <HeadingsForm
            featuredData={contentData['featured_section'] || {}}
            categoriesData={data}
            onFeaturedChange={v => setContentData(prev => ({ ...prev, featured_section: v }))}
            onCategoriesChange={v => setContentData(prev => ({ ...prev, [key]: v }))}
          />
        )}
        {key === 'footer' && <FooterForm {...formProps} />}
        {key === 'about_page' && <AboutPageForm {...formProps} />}
        {key === 'contact_page' && <ContactPageForm {...formProps} />}
        {key === 'reserve_page' && <ReservePageForm {...formProps} />}

        <div className="flex justify-end pt-4 border-t border-white/10">
          <button
            onClick={() => handleSaveContent(key)}
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <FiSave size={18} /> {saving ? 'Saving...' : `Save ${activeContent.label}`}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Landing Page Content
        </h1>
        <p className="text-gray-500 mt-1">Manage all dynamic content on the customer-facing website</p>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setActiveTab('sections')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'sections'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
              : 'glass-card hover:bg-white/10'
          }`}
        >
          Content Sections
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'listings'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
              : 'glass-card hover:bg-white/10'
          }`}
        >
          Listings
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'reviews'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
              : 'glass-card hover:bg-white/10'
          }`}
        >
          Customer Reviews
        </button>
      </div>

      {activeTab === 'sections' && (
        <div className="glass-card p-6">
          <Tabs tabs={CONTENT_KEYS} active={activeContent} onChange={setActiveContent} />
          <div className="border-t border-white/10 pt-6">
            {renderContentForm()}
          </div>
        </div>
      )}

      {activeTab === 'listings' && (
        <div className="glass-card p-6">
          <Tabs tabs={LISTING_TYPES} active={activeListing} onChange={setActiveListing} />
          <div className="border-t border-white/10 pt-6">
            <ListingTable key={activeListing.type} type={activeListing.type} />
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="glass-card p-6">
          <div className="border-t border-white/10 pt-6">
            <CustomerReviews />
          </div>
        </div>
      )}
    </div>
  );
}
