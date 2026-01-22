import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Camera, User as UserIcon } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { usersApi } from '@/services/api/users';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';

interface EditProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export function EditProfileSheet({ isOpen, onClose, user }: EditProfileSheetProps) {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState(user.username);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarData || null);
  const [error, setError] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: (data: { username?: string; avatarData?: string | null }) =>
      usersApi.updateProfile(user.id, data),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['userStats', user.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
    onError: (err: Error & { response?: { data?: { error?: { message?: string } } } }) => {
      setError(err.response?.data?.error?.message || 'Failed to update profile');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 256KB)
    if (file.size > 256 * 1024) {
      setError('Image must be smaller than 256KB');
      return;
    }

    setError(null);

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setAvatarPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setError(null);

    const updates: { username?: string; avatarData?: string | null } = {};

    if (username !== user.username) {
      updates.username = username;
    }

    if (avatarPreview !== user.avatarData) {
      updates.avatarData = avatarPreview;
    }

    if (Object.keys(updates).length === 0) {
      onClose();
      return;
    }

    updateMutation.mutate(updates);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Sheet */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-[60] p-6 pb-28 bg-zinc-900 rounded-t-3xl border-t border-zinc-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white">Edit Profile</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-zinc-700">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Avatar name={username} size="xl" className="w-full h-full text-2xl" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-lg"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Change photo
                </button>
                {avatarPreview && (
                  <>
                    <span className="text-zinc-600">|</span>
                    <button
                      onClick={handleRemoveAvatar}
                      className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Username Input */}
            <div className="mb-6">
              <Input
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                leftIcon={<UserIcon className="w-5 h-5" />}
                maxLength={20}
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl"
              >
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Save Button */}
            <Button
              variant="gold"
              className="w-full"
              onClick={handleSave}
              isLoading={updateMutation.isPending}
            >
              Save Changes
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
