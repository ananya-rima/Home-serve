import Logo from '../components/common/Logo';

const PublicFooter = () => (
  <footer className="border-t border-ink-100 bg-white">
    <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <Logo />
        <p className="mt-3 text-sm text-ink-500">
          Trusted home services, on demand. Book vetted professionals for every job around your home.
        </p>
      </div>
      <div>
        <h4 className="text-sm font-bold text-ink-800">Company</h4>
        <ul className="mt-3 space-y-2 text-sm text-ink-500">
          <li>About HomeServe</li>
          <li>Careers</li>
          <li>Contact</li>
        </ul>
      </div>
      <div>
        <h4 className="text-sm font-bold text-ink-800">For Providers</h4>
        <ul className="mt-3 space-y-2 text-sm text-ink-500">
          <li>Become a Provider</li>
          <li>Provider Resources</li>
        </ul>
      </div>
      <div>
        <h4 className="text-sm font-bold text-ink-800">Support</h4>
        <ul className="mt-3 space-y-2 text-sm text-ink-500">
          <li>Help Center</li>
          <li>Terms of Service</li>
          <li>Privacy Policy</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-ink-100 py-5 text-center text-xs text-ink-400">
      © {new Date().getFullYear()} HomeServe. All rights reserved.
    </div>
  </footer>
);

export default PublicFooter;
