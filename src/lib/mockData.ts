export const mockPackages = [
  {
    id: '1',
    name: 'UTBK Saintek Package',
    description: 'Paket lengkap untuk persiapan UTBK jurusan Saintek',
    active: true,
    created_at: '2024-05-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'UTBK Soshum Package',
    description: 'Paket lengkap untuk persiapan UTBK jurusan Soshum',
    active: true,
    created_at: '2024-05-01T00:00:00Z'
  }
];

export const mockSessions = [
  {
    id: '1',
    name: 'Try Out UTBK Saintek Mei 2024',
    package_id: '1',
    start_date: '2024-05-15T00:00:00Z',
    end_date: '2024-05-20T00:00:00Z',
    is_active: true,
    package: mockPackages[0]
  },
  {
    id: '2',
    name: 'Try Out UTBK Soshum Mei 2024',
    package_id: '2',
    start_date: '2024-05-15T00:00:00Z',
    end_date: '2024-05-20T00:00:00Z',
    is_active: true,
    package: mockPackages[1]
  }
];

export const mockUserTryouts = [
  {
    id: '1',
    created_at: '2024-05-01T00:00:00Z',
    status: 'completed',
    final_score: 850,
    package: mockPackages[0],
    session: mockSessions[0]
  }
];

export const mockSubtests = [
  {
    id: '1',
    name: 'Matematika Dasar',
    package_id: '1',
    duration: 30,
    order: 1
  },
  {
    id: '2',
    name: 'Fisika Dasar',
    package_id: '1',
    duration: 30,
    order: 2
  }
];

export const mockQuestions = [
  {
    id: '1',
    text: 'Berapakah hasil dari 2 + 2?',
    type: 'MC',
    options: {
      'A': '3',
      'B': '4',
      'C': '5',
      'D': '6'
    },
    correct_answer: 'B',
    subtest_id: '1'
  },
  {
    id: '2',
    text: 'Sebutkan rumus kecepatan?',
    type: 'SA',
    correct_answer: 'v = s/t',
    subtest_id: '2'
  }
];