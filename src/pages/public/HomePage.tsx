import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { FileSpreadsheet, Clock, BarChart3, Brain } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Persiapkan Masa Depanmu Dengan Latihan UTBK Terbaik
              </h1>
              <p className="text-lg md:text-xl text-primary-50">
                Platform try out UTBK online dengan soal berkualitas, analisis hasil yang komprehensif, dan strategi belajar yang dipersonalisasi.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  as={Link}
                  to="/register"
                  className="bg-white text-primary-700 hover:bg-primary-50"
                >
                  Daftar Sekarang
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  as={Link}
                  to="/features"
                  className="border-white text-white hover:bg-white/10"
                >
                  Pelajari Fitur
                </Button>
              </div>
              <p className="text-primary-100 text-sm">
                Sudah punya akun? <Link to="/login" className="text-white underline">Masuk di sini</Link>
              </p>
            </div>
            <div className="hidden md:block bg-white/10 p-8 rounded-lg shadow-xl">
              <img
                src="https://images.pexels.com/photos/4145153/pexels-photo-4145153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750"
                alt="Siswa belajar"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Kenapa Memilih Try Out UTBK Kami?</h2>
            <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
              Platform try out UTBK terlengkap dengan berbagai fitur yang akan membantu kamu mempersiapkan UTBK dengan lebih efektif.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<FileSpreadsheet className="h-8 w-8 text-primary-600" />}
              title="Soal Berkualitas"
              description="Soal-soal yang dirancang oleh tim ahli yang berpengalaman dalam UTBK."
            />
            <FeatureCard
              icon={<Clock className="h-8 w-8 text-primary-600" />}
              title="Simulasi Ujian Realistis"
              description="Rasakan pengalaman UTBK yang sesungguhnya dengan timing dan format yang sama."
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8 text-primary-600" />}
              title="Analisis Hasil Detail"
              description="Laporan lengkap tentang kekuatan dan kelemahan kamu di setiap mata pelajaran."
            />
            <FeatureCard
              icon={<Brain className="h-8 w-8 text-primary-600" />}
              title="Strategi Belajar Cerdas"
              description="Rekomendasi belajar yang dipersonalisasi berdasarkan hasil try out kamu."
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Apa Kata Mereka?</h2>
            <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
              Dengarkan pengalaman dari mereka yang telah berhasil masuk perguruan tinggi impian menggunakan platform kami.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="Try Out UTBK benar-benar membantu saya mempersiapkan UTBK dengan lebih terstruktur. Analisis hasil yang detail membantu saya fokus pada kelemahan saya."
              name="Budi Santoso"
              role="Mahasiswa Teknik UI"
              image="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750"
            />
            <TestimonialCard
              quote="Soal-soalnya sangat mirip dengan UTBK asli. Saya merasa lebih percaya diri saat menghadapi ujian karena sudah terbiasa dengan pola soalnya."
              name="Anisa Rahma"
              role="Mahasiswa Kedokteran UGM"
              image="https://images.pexels.com/photos/3757004/pexels-photo-3757004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750"
            />
            <TestimonialCard
              quote="Berkat Try Out UTBK, saya bisa mengidentifikasi materi yang perlu saya pelajari lebih dalam. Hasilnya, saya berhasil diterima di jurusan impian saya."
              name="Dimas Prayoga"
              role="Mahasiswa Hukum UNPAD"
              image="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold">Siap Untuk Masa Depan Yang Lebih Baik?</h2>
          <p className="text-lg text-primary-100 mt-4 max-w-3xl mx-auto">
            Bergabunglah dengan ribuan siswa lainnya yang telah merasakan manfaat dari Try Out UTBK kami. 
            Mulai persiapan UTBK kamu sekarang!
          </p>
          <div className="mt-8">
            <Button 
              size="lg" 
              as={Link} 
              to="/register"
              className="bg-white text-primary-700 hover:bg-primary-50"
            >
              Daftar Sekarang
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
    <div className="p-3 bg-primary-50 inline-block rounded-lg mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  image: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, name, role, image }) => (
  <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
    <p className="text-gray-600 italic mb-6">"{quote}"</p>
    <div className="flex items-center">
      <img 
        src={image} 
        alt={name} 
        className="w-12 h-12 rounded-full mr-4 object-cover"
      />
      <div>
        <p className="font-semibold text-gray-900">{name}</p>
        <p className="text-gray-500 text-sm">{role}</p>
      </div>
    </div>
  </div>
);

export default HomePage;