import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiChevronDown, FiX, FiSliders } from 'react-icons/fi';
import axios from 'axios';

const SHOW_MORE_THRESHOLD = 5;

function FilterSection({ group, activeFilters, onToggle }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const options = showAll ? group.options : group.options.slice(0, SHOW_MORE_THRESHOLD);
  const hasMore = group.options.length > SHOW_MORE_THRESHOLD;

  return (
    <div className="border-b border-gray-100 dark:border-slate-700/50 last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-3.5 px-1 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
      >
        <span>{group.name}</span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400"
        >
          <FiChevronDown size={14} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-3 px-1 space-y-1">
              {options.map((option) => {
                const optName = option.name || option;
                const isActive = activeFilters[group._id]?.includes(optName);
                return (
                  <label
                    key={optName}
                    onClick={() => onToggle(group._id, optName)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 ${
                      isActive
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/30'
                    }`}
                  >
                    <div className={`relative w-4 h-4 rounded border-2 transition-all duration-150 ${
                      isActive
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-gray-300 dark:border-gray-600 bg-transparent'
                    }`}>
                      {isActive && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 w-full h-full text-white p-0.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </motion.svg>
                      )}
                    </div>
                    <span className="text-sm font-medium">{optName}</span>
                  </label>
                );
              })}
              {hasMore && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-xs font-semibold text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 px-3 py-1.5 transition-colors"
                >
                  {showAll ? t('filters.showLess') : `+${group.options.length - SHOW_MORE_THRESHOLD} ${t('filters.more')}`}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FilterSidebar({ activeFilters, onToggleFilter, onClearAll }) {
  const { t } = useTranslation();
  const [filterGroups, setFilterGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilterGroups();
  }, []);

  const fetchFilterGroups = async () => {
    try {
      const { data } = await axios.get('/api/filter-groups');
      const all = data.data || [];
      setFilterGroups(all.filter(g => g.showInMenu !== false));
    } catch {
      setFilterGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const totalActive = Object.values(activeFilters).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700/50">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700/50">
        <div className="flex items-center gap-2">
          <FiSliders size={16} className="text-orange-500" />
          <span className="font-semibold text-gray-900 dark:text-white text-sm">{t('filters.title')}</span>
          {totalActive > 0 && (
            <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold rounded-full">
              {totalActive}
            </span>
          )}
        </div>
        {totalActive > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs font-semibold text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center gap-1"
          >
            <FiX size={12} />
            {t('filters.clearAll')}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-5">
        {loading ? (
          <div className="space-y-4 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-3" />
                <div className="space-y-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-8 bg-gray-100 dark:bg-slate-700/50 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filterGroups.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            No filters available
          </div>
        ) : (
          filterGroups.map((group) => (
            <FilterSection
              key={group._id}
              group={group}
              activeFilters={activeFilters}
              onToggle={onToggleFilter}
            />
          ))
        )}
      </div>

      {totalActive > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 dark:border-slate-700/50">
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(activeFilters).map(([groupId, options]) =>
              options.map((opt) => (
                <motion.span
                  key={`${groupId}-${opt}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-[11px] font-semibold rounded-full"
                >
                  {opt}
                  <button onClick={() => onToggleFilter(groupId, opt)} className="hover:text-orange-900 dark:hover:text-orange-200">
                    <FiX size={10} />
                  </button>
                </motion.span>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
