import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Palette, DollarSign, Calendar, FileText } from 'lucide-react';
import { useCreateCommission } from '../hooks/useCommissions';
import { useAuth } from '../AuthContext';

interface CommissionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  artistId: string;
  artistName: string;
}

export default function CommissionRequestModal({
  isOpen,
  onClose,
  artistId,
  artistName,
}: CommissionRequestModalProps) {
  const { user } = useAuth();
  const { create, submitting } = useCreateCommission();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setBudget('');
    setDeadline('');
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');

    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      setError('Please enter a valid budget amount.');
      return;
    }

    try {
      await create({
        artistId,
        artistName,
        title,
        description,
        budget: budgetNum,
        deadline: deadline ? new Date(deadline) : null,
        referenceImages: [],
      });
      setSuccess(true);
      // Auto-close after brief success state
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      console.error('Commission request error:', err);
      setError(err.message || 'Failed to submit commission request.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl glass-panel rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Palette className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground">
                  Request a Commission
                </h2>
                <p className="text-sm text-muted-foreground font-light">
                  Inquire with <span className="font-medium text-foreground">{artistName}</span> about custom work.
                </p>
              </div>
            </div>

            {/* Success State */}
            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-2">
                  Inquiry Sent
                </h3>
                <p className="text-muted-foreground font-light">
                  {artistName} has been notified. You'll see updates on your profile.
                </p>
              </motion.div>
            ) : (
              <>
                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase text-muted-foreground mb-2">
                      <FileText className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                      Project Title
                    </label>
                    <input
                      required
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={200}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder='E.g., "Character Portrait for Novel Cover"'
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase text-muted-foreground mb-2">
                      Detailed Brief
                    </label>
                    <textarea
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={5000}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-amber-500 transition-colors h-32 resize-none"
                      placeholder="Describe the scene, mood, dimensions, style references, and any specific requirements…"
                    />
                    <p className="text-xs text-muted-foreground/60 mt-1.5 text-right">
                      {description.length}/5000
                    </p>
                  </div>

                  {/* Budget & Deadline row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold tracking-widest uppercase text-muted-foreground mb-2">
                        <DollarSign className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                        Budget (USD)
                      </label>
                      <input
                        required
                        type="number"
                        min="1"
                        step="0.01"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-amber-500 transition-colors"
                        placeholder="250.00"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold tracking-widest uppercase text-muted-foreground mb-2">
                        <Calendar className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                        Desired Deadline
                      </label>
                      <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Gallery-style note */}
                  <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                    <p className="text-xs text-muted-foreground font-light leading-relaxed">
                      <span className="font-bold text-amber-500">How it works:</span>{' '}
                      This is an open inquiry. If <span className="font-medium">{artistName}</span> accepts,
                      you'll coordinate payment details directly — just like a gallery commission.
                    </p>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting || !user}
                    className="w-full py-4 mt-2 bg-foreground text-background font-bold rounded-xl hover:bg-amber-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Submit Inquiry'
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
