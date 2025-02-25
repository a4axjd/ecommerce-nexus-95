
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">About Us</h1>
          
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Founded in 2024, STORE has been at the forefront of providing high-quality products
                that blend style with functionality. Our journey began with a simple mission:
                to create a shopping experience that celebrates both craftsmanship and contemporary design.
              </p>
              <p className="text-gray-600">
                Today, we continue to curate collections that reflect our commitment to quality,
                sustainability, and timeless style. Each product in our store is carefully selected
                to ensure it meets our high standards and your expectations.
              </p>
            </div>
            
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8"
                alt="About Us"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
              <p className="text-gray-600">
                To provide exceptional products that enhance your lifestyle while maintaining
                the highest standards of quality and customer service.
              </p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Our Vision</h3>
              <p className="text-gray-600">
                To become the leading destination for thoughtfully designed products
                that inspire and delight our customers.
              </p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Our Values</h3>
              <p className="text-gray-600">
                Quality, integrity, sustainability, and exceptional customer service
                are at the heart of everything we do.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
