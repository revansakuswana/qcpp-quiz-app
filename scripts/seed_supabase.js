import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ukaxwgonpwfteamnnxzn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrYXh3Z29ucHdmdGVhbW5ueHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NzQ2OTYsImV4cCI6MjEwMTI1MDY5Nn0.3dosJ5qrfYPzBwXwkUNSLtKM6GsKyNVsDO1V1dd02jg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PARTICIPANTS = [
  'Jaelani', 'Tri Widodo', 'Agustinus Triono', 'Adi Suryanto', 'Ari Wijonarto',
  'Rizky Kienzle O', 'Wondo Sudarto', 'Teguh Suwitono', 'Slamet A', 'Dwi Angga Winata',
  'Kiswatak', 'Legiyanto', 'Fauzi Darwis', 'Sudibyo', 'Sopyan',
  'Agus Susanto', 'Dicky Ari Kurniawan', 'Muhajirin', 'M. Subandi', 'Cahyono',
  'Rosidi, SAG', 'Putra Fauzan Agung', 'Rangga Paksi Herdani Putra', 'Aldi', 'Anggi Muhlisin',
  'Dwi Febri Saputra', 'Harun Abidin', 'Muhamad Anis Ikhsan', 'Rikqi Setiawan', 'Wayan Kerte',
  'Dian Arifin', 'Feri Anwar', 'Feri Eko Saputra', 'Dava Hafizza', 'Arif Waluyo Bonar',
  'Andi Angga Saputra', 'Syapriansah', 'Sindu Andion', 'Muhammad Sulthan Faris', 'I Made Cerita',
  'Beni Santoso', 'Deni Rudiyanto', 'Rama Dana', 'Rido Nusa Putra', 'Septian Adi Saputra',
  'Hamdani', 'Anggi Putra', 'Dian Candra', 'Muhammad Ilham Rasyidin', 'Tri Irwanto',
  'Suhendri', 'Wiyanto', 'Dodi Saputra', 'Hadi Irawan', 'Setiawan',
  'Tedi Hadi Suryanto', 'Agus Tiawan', 'Muhammad Dedy Prasetyo', 'Dicky Agastian', 'Yogi Sektiawan Pranoto',
  'Ivan Rivandi', 'Solikhin', 'Wahyu Darmawan', 'Ardi Abdul Majid', 'Ridho Jula Ariyanto',
  'Susilo', 'Dimas Ramadhiansyah', 'Ahmad Hafif Fauzi', 'Wiyatno', 'Achmad Inzan Masruri',
  'Ari Saputra'
];

const QUESTIONS = [
  {
    question_text: 'Bagaimana cara menghitung % bonggol tercacah?',
    options: [
      '% Bonggol Tercacah (BC) = (10 – jumlah bonggol yang utuh) / 10 x 100%.',
      '% Bonggol Tercacah (BC) = (15 – jumlah bonggol yang utuh) / 10 x 100%.',
      '% Bonggol Tercacah (BC) = (10 – jumlah bonggol yang utuh) / 5 x 100%.',
      'Semua jawaban diatas salah'
    ],
    correct_option_index: 0, // Jawaban A
    time_limit: 20,
    points: 1000,
  },
  {
    question_text: 'Bonggol utuh adalah bonggol yang tidak tercacah dengan panjang .... Cm:',
    options: [
      '<10cm',
      '>10cm',
      '≥10 cm',
      '0 cm'
    ],
    correct_option_index: 2, // Jawaban C
    time_limit: 15,
    points: 1000,
  },
  {
    question_text: 'Berapa % Standart Agregat/lolos ayakan pada Pengamatan Finishing (implemen rotary ridger)?',
    options: [
      '>70%',
      '<70%',
      '≥ 70%',
      '50%'
    ],
    correct_option_index: 2, // Jawaban C
    time_limit: 15,
    points: 1000,
  },
  {
    question_text: 'Sebutkan urutan cara kerja pengambilan sampel ukuran agregat:',
    options: [
      'Mengambil sampel tanah, tanah ditimbang, tanah diayak, lalu bongkahan tidak std ditimbang',
      'Mengambil sampel tanah, tanah bongkahan diayak, tanah ditimbang',
      'Mengambil sampel tanah, tanah diayak, bongkahan dibuang',
      'Mengambil sampel tanah langsung dibuang'
    ],
    correct_option_index: 0, // Jawaban A
    time_limit: 25,
    points: 1000,
  },
  {
    question_text: 'Apa standar kualitas aplikasi pinggiran?',
    options: [
      'Tidak dilakukan',
      'Dilakukan aplikasi pinggiran',
      'Lolos ayakan',
      'Semua benar'
    ],
    correct_option_index: 1, // Jawaban B
    time_limit: 15,
    points: 1000,
  },
  {
    question_text: 'Berapa std lolos ayakan agregat bajak rake?',
    options: [
      '>=60%',
      '55%',
      '>=55%',
      '<50%'
    ],
    correct_option_index: 0, // Jawaban A
    time_limit: 15,
    points: 1000,
  },
  {
    question_text: 'Berapakah standar kedalaman subsoil?',
    options: [
      '>60cm',
      '>=60cm',
      '<60cm',
      '50cm'
    ],
    correct_option_index: 1, // Jawaban B
    time_limit: 15,
    points: 1000,
  },
  {
    question_text: 'Apa saja yang diamati dalam pengamatan subsoil dan berapa bobot masing-masing item?',
    options: [
      'kedalaman aplikasi (50%) & kerataan aplikasi/jarak antar leg (50%)',
      'kedalaman aplikasi (60%) & kerataan aplikasi/jarak antar leg (40%)',
      'kedalaman aplikasi (60%) & kerapatan aplikasi (40%)',
      'kedalaman aplikasi (70%) & kerataan aplikasi (30%)'
    ],
    correct_option_index: 0, // Jawaban A
    time_limit: 20,
    points: 1000,
  }
];

async function seedData() {
  console.log('🚀 Memulai seeding data ke Supabase cloud...');

  // 1. Insert Quiz
  const quizCode = 'QCPP-AGRI';
  const { data: quizData, error: quizError } = await supabase
    .from('quizzes')
    .insert([
      {
        title: 'Uji Profisiensi & Pengamatan Agregat Tanah 🚜',
        description: 'Quiz Evaluasi Pengamatan Finishing, Subsoil, Bonggol, dan Bajak Rake',
        code: quizCode,
        allowed_participants: PARTICIPANTS,
      }
    ])
    .select()
    .single();

  if (quizError) {
    console.error('⚠️ Gagal membuat Quiz di Supabase:', quizError.message);
  } else {
    console.log(`✅ Quiz berhasil dibuat! ID: ${quizData.id}, Code: ${quizData.code}`);

    // 2. Insert Questions
    const questionsToInsert = QUESTIONS.map((q) => ({
      quiz_id: quizData.id,
      question_text: q.question_text,
      options: q.options,
      correct_option_index: q.correct_option_index,
      time_limit: q.time_limit,
      points: q.points,
    }));

    const { data: qData, error: qError } = await supabase
      .from('questions')
      .insert(questionsToInsert)
      .select();

    if (qError) {
      console.error('⚠️ Gagal memasukkan Pertanyaan:', qError.message);
    } else {
      console.log(`✅ ${qData.length} Pertanyaan berhasil dimasukkan ke Supabase!`);
    }

    // 3. Insert Participants
    const avatars = ['🦊', '🦄', '🐯', '🐼', '🦁', '🐱', '🐉', '🦉', '🚀', '🤖', '👾', '👑'];
    const participantsToInsert = PARTICIPANTS.map((pName, idx) => ({
      quiz_id: quizData.id,
      name: pName,
      avatar: avatars[idx % avatars.length],
    }));

    const { data: pData, error: pError } = await supabase
      .from('participants')
      .insert(participantsToInsert)
      .select();

    if (pError) {
      console.error('⚠️ Gagal memasukkan Peserta:', pError.message);
    } else {
      console.log(`✅ ${pData ? pData.length : PARTICIPANTS.length} Nama Peserta berhasil di-seed ke Supabase!`);
    }
  }

  console.log('🎉 Seeding selesai!');
}

seedData();
