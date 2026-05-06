const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">Terms of Service</h1>
      
      <div className="glass p-8 md:p-12 rounded-3xl space-y-8 text-gray-300">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">1. Agreement to Terms</h2>
          <p>
            By accessing or using our website and services, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access our service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">2. Products and Pricing</h2>
          <p>
            All products are subject to availability, and we cannot guarantee that items will be in stock. We reserve the right to discontinue any products at any time for any reason. Prices for all products are subject to change.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">3. User Accounts</h2>
          <p>
            When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">4. Shipping and Returns</h2>
          <p>
            Please review our Shipping and Return policies carefully before making any purchases. We are not responsible for delays caused by shipping carriers or customs clearance.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">5. Governing Law</h2>
          <p>
            These terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
