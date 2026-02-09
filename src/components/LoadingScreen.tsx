const LoadingScreen = ({ label = 'Loading...' }: { label?: string }) => {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="premium-panel w-full max-w-sm rounded-2xl px-6 py-8 text-center flex flex-col items-center">
        <img src="/mitadt_logo.png" alt="MIT ADT Logo" className="h-16 w-auto mb-4" />
        <p className="brand-heading text-lg font-semibold text-brand-800">PlacePro- MIT ADT</p>
        <p className="mt-2 text-sm font-medium text-ink-600">{label}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
