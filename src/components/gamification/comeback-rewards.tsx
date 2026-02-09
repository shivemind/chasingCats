'use client';

interface ComebackReward {
  id: string;
  day: number;
  title: string;
  description: string;
  icon: string;
  xpAmount: number;
  bonusType?: 'badge' | 'preset' | 'discount' | 'content';
  bonusValue?: string;
  isClaimed: boolean;
}

interface ComebackProgress {
  daysSinceReturn: number;
  currentStreak: number;
  totalRewardsClaimed: number;
  rewards: ComebackReward[];
}

// Comeback modal shown when user returns after absence
export function ComebackModal({ 
  progress, 
  isOpen, 
  onClose,
  onClaim 
}: { 
  progress: ComebackProgress; 
  isOpen: boolean; 
  onClose: () => void;
  onClaim: (rewardId: string) => void;
}) {
  if (!isOpen) return null;

  const claimableReward = progress.rewards.find(r => r.day === progress.daysSinceReturn && !r.isClaimed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto py-8">
      <div className="w-full max-w-lg mx-4 animate-scale-in">
        <div className="rounded-3xl border border-white/10 bg-deep-space overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-cat-eye/30 to-orange-500/30 p-8 text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              ✕
            </button>
            
            <span className="text-6xl">🎉</span>
            <h2 className="text-2xl font-bold text-white mt-4">Welcome Back!</h2>
            <p className="text-gray-400 mt-2">We missed you! Here&apos;s a special reward.</p>
          </div>

          {/* Daily rewards calendar */}
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Comeback Rewards</h3>
            <div className="grid grid-cols-7 gap-2">
              {progress.rewards.map((reward) => {
                const isToday = reward.day === progress.daysSinceReturn;
                const isFuture = reward.day > progress.daysSinceReturn;

                return (
                  <div
                    key={reward.id}
                    className={`relative aspect-square rounded-xl flex flex-col items-center justify-center ${
                      isToday 
                        ? 'bg-gradient-to-br from-cat-eye/30 to-orange-500/30 border-2 border-cat-eye' 
                        : reward.isClaimed
                        ? 'bg-green-500/20'
                        : isFuture
                        ? 'bg-white/5 opacity-50'
                        : 'bg-white/5'
                    }`}
                  >
                    <span className="text-lg">{reward.isClaimed ? '✅' : reward.icon}</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">Day {reward.day}</span>
                    {isToday && !reward.isClaimed && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-cat-eye animate-ping" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's reward */}
          {claimableReward && (
            <div className="px-6 pb-6">
              <div className="rounded-2xl bg-gradient-to-r from-cat-eye/20 to-orange-500/20 border border-cat-eye/30 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cat-eye to-orange-500">
                    <span className="text-3xl">{claimableReward.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{claimableReward.title}</h3>
                    <p className="text-sm text-gray-400">{claimableReward.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="rounded-full bg-cat-eye/20 px-2 py-0.5 text-xs text-cat-eye font-medium">
                        +{claimableReward.xpAmount} XP
                      </span>
                      {claimableReward.bonusValue && (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white">
                          {claimableReward.bonusValue}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onClaim(claimableReward.id)}
                  className="mt-4 w-full rounded-full bg-gradient-to-r from-cat-eye to-orange-500 py-3 font-bold text-black"
                >
                  🎁 Claim Reward
                </button>
              </div>
            </div>
          )}

          {/* Already claimed state */}
          {!claimableReward && progress.daysSinceReturn > 0 && (
            <div className="px-6 pb-6 text-center">
              <p className="text-gray-400">Come back tomorrow for more rewards!</p>
              <button
                onClick={onClose}
                className="mt-4 w-full rounded-full bg-white/10 py-3 font-medium text-white"
              >
                Continue Learning
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Streak recovery indicator
export function StreakRecovery({ 
  originalStreak, 
  daysInactive,
  recoveryReward 
}: { 
  originalStreak: number;
  daysInactive: number;
  recoveryReward: number;
}) {
  // Unused state for future recovery animation
  // const [isRecovered, setIsRecovered] = useState(false);

  return (
    <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-red-500/10 p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20">
          <span className="text-2xl">🔥</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white">Recover Your {originalStreak}-Day Streak!</h3>
          <p className="text-sm text-gray-400">
            You were inactive for {daysInactive} days. Complete a lesson today to restore it!
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-orange-400">+{recoveryReward} XP</p>
          <p className="text-xs text-gray-500">bonus</p>
        </div>
      </div>
    </div>
  );
}

// Win-back notification
export function WinBackNotification({ 
  daysAway, 
  specialOffer 
}: { 
  daysAway: number;
  specialOffer?: { discount: number; expiresIn: string };
}) {
  return (
    <div className="rounded-2xl border border-neon-purple/30 bg-gradient-to-br from-neon-purple/10 to-pink-500/10 p-6">
      <div className="text-center">
        <span className="text-5xl">👋</span>
        <h2 className="text-xl font-bold text-white mt-4">We Miss You!</h2>
        <p className="text-gray-400 mt-2">
          It&apos;s been {daysAway} days since your last visit.
        </p>

        {specialOffer && (
          <div className="mt-6 rounded-xl bg-cat-eye/20 border border-cat-eye/30 p-4">
            <p className="text-cat-eye font-bold text-2xl">{specialOffer.discount}% OFF</p>
            <p className="text-sm text-gray-400 mt-1">Pro membership • Expires in {specialOffer.expiresIn}</p>
          </div>
        )}

        <div className="mt-6 space-y-2">
          <button className="w-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple py-3 font-semibold text-white">
            Jump Back In →
          </button>
          <p className="text-xs text-gray-500">+ Earn comeback bonuses for 7 days</p>
        </div>
      </div>
    </div>
  );
}
