function HeroShowcase() {
  return (
    <aside className="hero-showcase" aria-label="Donation activity preview">
      <div className="hero-mini-grid" aria-hidden="true">
        <article>
          <img
            src="https://images.unsplash.com/photo-1609139003551-ee40f5f73ec0?auto=format&fit=crop&w=500&q=80"
            alt=""
          />
          <strong>Help the hungry with food packages</strong>
          <span>2.8K donations</span>
        </article>
        <article>
          <img
            src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=500&q=80"
            alt=""
          />
          <strong>Protect families with daily essentials</strong>
          <span>1.4K claims</span>
        </article>
      </div>

      <div className="hero-photo-wrap">
        <img
          className="hero-image"
          src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80"
          alt="Volunteers sorting donated food boxes"
        />
        <div className="hero-float hero-float-left">
          <span className="tag">Food and care</span>
          <strong>Join the caring movement for a better future.</strong>
          <small>10,000 people helped through matched donations.</small>
        </div>
        <div className="hero-float hero-float-right">
          <strong>245 units</strong>
          <span className="meter">
            <span style={{ width: '64%' }} />
          </span>
          <small>Ready for approved charities to claim.</small>
        </div>
      </div>

      <div className="hero-total">
        <span>Positive impact</span>
        <strong>289,699+</strong>
      </div>
    </aside>
  )
}

export default HeroShowcase
