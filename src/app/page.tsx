import { CatalogSearch } from '@/components/CatalogSearch';
import { Hero } from '@/components/Hero';
import {
  AudienceSection,
  CTASection,
  FeaturesSection,
  HowItWorksSection,
  LandingFooter,
  ProblemSection,
  RolesSection,
  ValueSection,
} from '@/components/LandingSections';
import { ParallaxBackground } from '@/components/ParallaxBackground';
import { ListingCard } from '@/components/listings/ListingCard';
import { LedgerSummary } from '@/components/listings/LedgerSummary';
import { serverFetchListings, serverFetchPayoutSummary } from '@/lib/api/listings';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [listings, summary] = await Promise.all([
    serverFetchListings(q),
    serverFetchPayoutSummary(),
  ]);

  return (
    <div className="landing">
      <ParallaxBackground />
      <Hero />
      <ProblemSection />
      <ValueSection />
      <HowItWorksSection />
      <FeaturesSection />
      <AudienceSection />
      <RolesSection />

      {summary && (
        <section className="landing-section section-ledger" id="transparency">
          <div className="section-inner">
            <p className="eyebrow">Transparency</p>
            <h2>Public payout ledger</h2>
            <p className="lead section-lead">
              Aggregated, anonymized summaries so anyone can verify fees reach mentors as claimed.
            </p>
            <LedgerSummary summary={summary} />
          </div>
        </section>
      )}

      <section className="landing-section section-listings" id="listings">
        <div className="section-inner">
          <div className="listings-header">
            <div>
              <p className="eyebrow">Catalog</p>
              <h2>Active mentorship listings</h2>
            </div>
            <CatalogSearch initialQuery={q ?? ''} />
          </div>
          {listings.length === 0 ? (
            <p className="muted listings-empty">
              {q ? `No results for "${q}"` : 'No active listings yet — check back soon.'}
            </p>
          ) : (
            <div className="grid">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection />
      <LandingFooter />
    </div>
  );
}
