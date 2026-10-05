const LOOM_SRC =
  "https://www.loom.com/embed/cef44874ba2e4bc6b318c58ff9aaffe6?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true";

export const DemoSection = () => {
  return (
    <section id="demo" aria-label="See the product" className="content-section">
      <div className="section-intro">
        <span className="label">Demo</span>
        <h2>See the product</h2>
        <p>A two-minute walkthrough.</p>
      </div>

      <div className="demo-frame">
        <div className="phone phone-lg">
          <div className="phone-screen demo-screen">
            <iframe
              src={LOOM_SRC}
              title="TappedIn product demo"
              allow="fullscreen; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
