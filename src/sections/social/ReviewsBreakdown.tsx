import React, { useId, useMemo } from 'react';
import { Star, CheckCircle, ThumbsUp } from 'lucide-react';
import { ReviewsBreakdownSettings, StarRatingBucket } from '../../types/section';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';

export interface ReviewsBreakdownProps {
  settings: ReviewsBreakdownSettings;
  id?: string;
  className?: string;
}

export const ReviewsBreakdown: React.FC<ReviewsBreakdownProps> = ({
  settings,
  id,
  className,
}) => {
  const {
    heading = 'Customer Reviews & Ratings',
    averageRating = 4.8,
    totalReviews = 0,
    recommendedPercentage = 96,
    distribution,
    featuredReview,
  } = settings;

  const sectionId = id || useId();

  // Synthetic distribution fallback if not explicitly provided
  const buckets: StarRatingBucket[] = useMemo(() => {
    if (distribution && distribution.length > 0) {
      return [...distribution].sort((a, b) => b.stars - a.stars);
    }

    // Realistic synthesis based on averageRating and totalReviews
    const total = totalReviews || 100;
    const p5 = Math.min(Math.max(Math.round((averageRating / 5) * 78), 50), 92);
    const p4 = Math.min(Math.round((100 - p5) * 0.7), 35);
    const p3 = Math.min(Math.round((100 - p5 - p4) * 0.6), 15);
    const p2 = Math.min(Math.round((100 - p5 - p4 - p3) * 0.5), 8);
    const p1 = Math.max(100 - p5 - p4 - p3 - p2, 0);

    return [
      { stars: 5, percentage: p5, count: Math.round((p5 / 100) * total) },
      { stars: 4, percentage: p4, count: Math.round((p4 / 100) * total) },
      { stars: 3, percentage: p3, count: Math.round((p3 / 100) * total) },
      { stars: 2, percentage: p2, count: Math.round((p2 / 100) * total) },
      { stars: 1, percentage: p1, count: Math.round((p1 / 100) * total) },
    ];
  }, [distribution, averageRating, totalReviews]);

  return (
    <section
      id={sectionId}
      data-section-type="reviews-breakdown"
      className={cn('w-full py-12 md:py-20 px-4 sm:px-6 lg:px-8', className)}
    >
      <div className="max-w-7xl mx-auto">
        {heading && (
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text,#111827)] text-center mb-10 md:mb-14">
            {heading}
          </h2>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Overall Rating Score (4 cols) */}
          <div className="lg:col-span-4 p-6 sm:p-8 bg-[var(--color-surface,#ffffff)] border border-[var(--color-border,#e5e7eb)] rounded-[var(--radius-card,0.75rem)] shadow-sm text-center">
            <div className="font-heading text-5xl sm:text-6xl font-bold text-[var(--color-text,#111827)] tracking-tight">
              {averageRating.toFixed(1)}
            </div>

            <div className="flex items-center justify-center gap-1.5 my-3" aria-label={`${averageRating} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-5 h-5',
                    i < Math.floor(averageRating)
                      ? 'text-amber-400 fill-amber-400'
                      : i < averageRating
                      ? 'text-amber-400 fill-amber-400/50'
                      : 'text-neutral-300 dark:text-neutral-700'
                  )}
                  aria-hidden="true"
                />
              ))}
            </div>

            <p className="font-body text-sm text-[var(--color-text-muted,#6b7280)]">
              Based on {totalReviews.toLocaleString()} verified customer reviews
            </p>

            {recommendedPercentage !== undefined && (
              <div className="mt-5 pt-5 border-t border-[var(--color-border,#e5e7eb)] flex items-center justify-center gap-2">
                <Badge variant="success" size="md" icon={<ThumbsUp className="w-3.5 h-3.5" />}>
                  {recommendedPercentage}% recommend this store
                </Badge>
              </div>
            )}
          </div>

          {/* Middle/Right Column: Star Distribution Bars (5 or 8 cols) */}
          <div
            className={cn(
              featuredReview ? 'lg:col-span-4' : 'lg:col-span-8',
              'p-6 sm:p-8 bg-[var(--color-surface,#ffffff)] border border-[var(--color-border,#e5e7eb)] rounded-[var(--radius-card,0.75rem)] shadow-sm'
            )}
          >
            <h3 className="font-heading font-semibold text-lg text-[var(--color-text,#111827)] mb-5">
              Rating Distribution
            </h3>

            <div className="space-y-3.5">
              {buckets.map((bucket) => (
                <div key={bucket.stars} className="flex items-center gap-3 text-sm">
                  {/* Star count label */}
                  <div className="flex items-center gap-1 w-12 shrink-0">
                    <span className="font-medium text-[var(--color-text,#111827)]">{bucket.stars}</span>
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" aria-hidden="true" />
                  </div>

                  {/* Progress Bar Track */}
                  <div
                    className="flex-1 h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={bucket.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${bucket.stars} star reviews: ${bucket.percentage}%`}
                  >
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${bucket.percentage}%` }}
                    />
                  </div>

                  {/* Percentage / Count label */}
                  <span className="w-12 text-right text-xs text-[var(--color-text-muted,#6b7280)] shrink-0">
                    {bucket.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Featured Review (4 cols, optional) */}
          {featuredReview && (
            <div className="lg:col-span-4 p-6 sm:p-8 bg-[var(--color-surface,#ffffff)] border border-[var(--color-border,#e5e7eb)] rounded-[var(--radius-card,0.75rem)] shadow-sm relative">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="success" size="sm" icon={<CheckCircle className="w-3 h-3" />}>
                  Verified Buyer
                </Badge>
                {featuredReview.date && (
                  <span className="text-xs text-[var(--color-text-muted,#6b7280)]">
                    {featuredReview.date}
                  </span>
                )}
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-4 h-4',
                      i < featuredReview.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-neutral-300 dark:text-neutral-700'
                    )}
                    aria-hidden="true"
                  />
                ))}
              </div>

              <h4 className="font-heading font-bold text-base sm:text-lg text-[var(--color-text,#111827)] mb-2">
                &ldquo;{featuredReview.title}&rdquo;
              </h4>

              <p className="font-body text-sm text-[var(--color-text-muted,#6b7280)] leading-relaxed italic mb-4">
                {featuredReview.content}
              </p>

              <div className="pt-3 border-t border-[var(--color-border,#e5e7eb)] text-xs font-semibold text-[var(--color-text,#111827)]">
                — {featuredReview.author}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReviewsBreakdown;
