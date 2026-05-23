import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import Confetti from 'react-confetti';
import { Download, Share2, Award, ArrowLeft } from 'lucide-react';

// Register fonts for PDF
Font.register({
  family: 'Oswald',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf'
});

const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#ffffff', padding: 50 },
  border: { border: '10pt solid #111827', padding: 40, height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 40, fontFamily: 'Oswald', color: '#111827', marginBottom: 20 },
  subtitle: { fontSize: 18, color: '#4B5563', marginBottom: 40 },
  name: { fontSize: 36, color: '#3B82F6', marginBottom: 40, borderBottom: '2pt solid #3B82F6', paddingBottom: 10, width: '80%', textAlign: 'center' },
  text: { fontSize: 14, color: '#4B5563', marginBottom: 20, textAlign: 'center', lineHeight: 1.5 },
  footer: { position: 'absolute', bottom: 50, left: 50, right: 50, flexDirection: 'row', justifyContent: 'space-between' },
  signature: { fontSize: 12, color: '#111827', borderTop: '1pt solid #111827', paddingTop: 10, width: 150, textAlign: 'center' },
  id: { fontSize: 10, color: '#9CA3AF' }
});

const CertDocument = ({ user, dbType, date, certId }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.border}>
        <Text style={styles.title}>CERTIFICATE OF COMPLETION</Text>
        <Text style={styles.subtitle}>This is to certify that</Text>
        <Text style={styles.name}>{user?.name || 'Student Name'}</Text>
        <Text style={styles.text}>
          has successfully completed the {dbType.toUpperCase()} module on LearnDB.{"\n"}
          Demonstrating proficiency in data querying, schema design, and core database concepts.
        </Text>
        <View style={styles.footer}>
          <View>
            <Text style={styles.signature}>LearnDB Platform</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.id}>Date: {date}</Text>
            <Text style={styles.id}>ID: {certId}</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

const CertificateView = () => {
  const { db } = useParams();
  const { user } = useAuth();
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowDimensions, setWindowDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    
    // Stop confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  const certId = `LDB-${db.toUpperCase()}-${user?.id || '000'}-${Math.floor(Math.random() * 10000)}`;
  const date = new Date().toLocaleDateString();

  const getTheme = () => {
    switch(db) {
      case 'postgres': return { bg: 'bg-blue-900', text: 'text-blue-400', border: 'border-blue-500/50' };
      case 'mongo': return { bg: 'bg-emerald-900', text: 'text-emerald-400', border: 'border-emerald-500/50' };
      case 'neo4j': return { bg: 'bg-purple-900', text: 'text-purple-400', border: 'border-purple-500/50' };
      default: return { bg: 'bg-gray-900', text: 'text-gray-400', border: 'border-gray-500/50' };
    }
  };

  const theme = getTheme();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center py-12 px-4">
      {showConfetti && <Confetti width={windowDimensions.width} height={windowDimensions.height} recycle={false} numberOfPieces={500} />}

      <div className="max-w-4xl w-full z-10">
        <Link to={`/learn/${db}`} className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 w-max">
          <ArrowLeft className="w-4 h-4" /> Back to Module
        </Link>

        <div className="text-center mb-10">
          <Award className={`w-20 h-20 mx-auto mb-4 ${theme.text}`} />
          <h1 className="text-4xl font-display font-bold text-white mb-2">Congratulations!</h1>
          <p className="text-gray-400 text-lg">You have mastered the {db} module.</p>
        </div>

        {/* Certificate Preview Box */}
        <div className={`w-full aspect-[1.414/1] md:aspect-[1.414/1] rounded-lg border-8 ${theme.border} ${theme.bg} relative overflow-hidden flex items-center justify-center p-8 mb-8 shadow-2xl`}>
          <div className="bg-white/10 backdrop-blur border border-white/20 w-full h-full p-8 flex flex-col items-center justify-center text-center">
             <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-2 tracking-widest uppercase opacity-90">Certificate</h2>
             <p className="text-white/70 mb-8 tracking-widest uppercase text-sm">of Completion</p>
             
             <p className="text-white/60 text-sm mb-2">This is presented to</p>
             <p className={`text-4xl md:text-5xl font-display font-bold ${theme.text} mb-8 border-b border-white/20 pb-4 px-12`}>
               {user?.name || 'Awesome Developer'}
             </p>
             
             <p className="text-white/80 max-w-lg mx-auto leading-relaxed text-sm md:text-base">
               For successfully completing all lessons, challenges, and quizzes in the {db.toUpperCase()} curriculum on LearnDB.
             </p>

             <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
               <div className="text-left border-t border-white/30 pt-2 w-32">
                 <p className="text-white/50 text-xs">LearnDB Platform</p>
               </div>
               <div className="text-right">
                 <p className="text-white/50 text-xs">Date: {date}</p>
                 <p className="text-white/40 text-[10px] font-mono mt-1">{certId}</p>
               </div>
             </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {user && (
            <PDFDownloadLink 
              document={<CertDocument user={user} dbType={db} date={date} certId={certId} />} 
              fileName={`${db}-certificate-${user.name.replace(/\s+/g, '-')}.pdf`}
              className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-white text-background font-bold hover:bg-gray-200 transition-colors"
            >
              {({ blob, url, loading, error }) =>
                loading ? 'Generating PDF...' : <><Download className="w-5 h-5" /> Download as PDF</>
              }
            </PDFDownloadLink>
          )}
          
          <button className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg border border-borderLine text-white hover:bg-surface transition-colors">
            <Share2 className="w-5 h-5" /> Share on LinkedIn
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateView;
