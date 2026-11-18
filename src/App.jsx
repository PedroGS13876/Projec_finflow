import React, { useState, useMemo } from 'react';
import {
  Wallet,
  CreditCard,
  TrendingUp,
  PiggyBank,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sliders,
  Trash2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Target,
  X,
  Repeat,
  Check,
  ShieldCheck,
  Plane,
  Laptop,
  Filter,
  Users,
  HeartHandshake,
  UserPlus,
  LogOut,
  Home,
  Stethoscope,
  Lock,
  Mail,
  User,
  KeyRound,
  ArrowRight,
  FolderPlus,
  FileText,
  Download,
  Printer,
  FileSpreadsheet
} from 'lucide-react';

// Chave de armazenamento local para persistir contas, perfis e transações separadas por usuário
const STORAGE_KEY = 'finflow_multi_account_v3';

// Meses disponíveis para controle atual e projeção futura (sem dados fictícios retroativos)
const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const AVAILABLE_MONTHS = Array.from({ length: 36 }, (_, i) => {
  const d = new Date(2026, 10 + i, 1);
  const y = d.getFullYear();
  const m = d.getMonth();
  return {
    id: `${y}-${String(m + 1).padStart(2, '0')}`,
    label: `${MONTH_NAMES[m].slice(0, 3)}/${y}`,
    fullName: `${MONTH_NAMES[m]} ${y}`,
  };
});

// Retorna o mês atual no formato YYYY-MM (com fallback para o primeiro mês disponível)
const getCurrentMonthId = () => {
  const now = new Date();
  const currentId = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return AVAILABLE_MONTHS.some((m) => m.id === currentId) ? currentId : AVAILABLE_MONTHS[0].id;
};

// Cartões e Contas configurados
const PAYMENT_METHODS = [
  { id: 'nubank', name: 'Cartão Nubank', dueDay: 10, color: 'text-purple-400', badge: 'bg-purple-500/10 border-purple-500/30 text-purple-300' },
  { id: 'itau', name: 'Cartão Itaú', dueDay: 20, color: 'text-orange-400', badge: 'bg-orange-500/10 border-orange-500/30 text-orange-300' },
  { id: 'conta', name: 'Pix / Débito', dueDay: null, color: 'text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' },
];

// Temas de Avatar disponíveis para criação de perfis
const PROFILE_AVATARS = [
  { id: 'emerald', label: 'Esmeralda', bg: 'from-emerald-400 to-teal-600', ring: 'border-emerald-400', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', icon: 'user' },
  { id: 'amber', label: 'Âmbar', bg: 'from-amber-400 to-orange-500', ring: 'border-amber-400', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30', icon: 'heart' },
  { id: 'violet', label: 'Violeta', bg: 'from-violet-400 to-purple-600', ring: 'border-violet-400', badge: 'bg-violet-500/15 text-violet-300 border-violet-500/30', icon: 'sparkles' },
  { id: 'cyan', label: 'Ciano', bg: 'from-cyan-400 to-blue-600', ring: 'border-cyan-400', badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', icon: 'shield' },
];

// Dados iniciais por perfil (Isolamento completo)
const INITIAL_PROFILES_DATA = {
  'profile-pedro': {
    id: 'profile-pedro',
    name: 'Pedro',
    role: 'Meu Controle',
    avatarTheme: 'emerald',
    monthlyIncome: 4500,
    rule: { essencial: 50, lazer: 30, investimento: 20 },
    transactions: [
      { id: 't-nov-1', monthId: '2026-11', description: 'Aluguel + Condomínio', amount: 1450, category: 'essencial', type: 'fixo', method: 'conta', status: 'pago', dueDate: '05/11/2026' },
      { id: 't-nov-2', monthId: '2026-11', description: 'Supermercado & Feira', amount: 620, category: 'essencial', type: 'avista', method: 'conta', status: 'pago', dueDate: '08/11/2026' },
      { id: 't-nov-3', monthId: '2026-11', description: 'Internet Fibra + Energia', amount: 240, category: 'essencial', type: 'fixo', method: 'conta', status: 'pago', dueDate: '12/11/2026' },
      { id: 't-nov-4', monthId: '2026-11', description: 'Monitor Ultrawide (2/4)', amount: 350, category: 'lazer', type: 'parcelado', method: 'nubank', status: 'pago', installmentInfo: 'Parcela 2/4', dueDate: '10/11/2026' },
      { id: 't-nov-5', monthId: '2026-11', description: 'Passagem Aérea Férias (1/3)', amount: 480, category: 'lazer', type: 'parcelado', method: 'itau', status: 'pendente', installmentInfo: 'Parcela 1/3', dueDate: '20/11/2026' },
      { id: 't-nov-6', monthId: '2026-11', description: 'Farmácia & Exames (1/2)', amount: 165, category: 'essencial', type: 'parcelado', method: 'itau', status: 'pendente', installmentInfo: 'Parcela 1/2', dueDate: '20/11/2026' },
      { id: 't-nov-7', monthId: '2026-11', description: 'Jantar & Cinema Fim de Semana', amount: 210, category: 'lazer', type: 'avista', method: 'itau', status: 'pendente', dueDate: '20/11/2026' },
      { id: 't-nov-8', monthId: '2026-11', description: 'Aporte Reserva de Emergência', amount: 600, category: 'investimento', type: 'investimento', method: 'conta', status: 'pago', dueDate: '05/11/2026' },

      { id: 't-dec-1', monthId: '2026-12', description: 'Aluguel + Condomínio', amount: 1450, category: 'essencial', type: 'fixo', method: 'conta', status: 'pendente', dueDate: '05/12/2026' },
      { id: 't-dec-2', monthId: '2026-12', description: 'Internet Fibra + Energia', amount: 240, category: 'essencial', type: 'fixo', method: 'conta', status: 'pendente', dueDate: '12/12/2026' },
      { id: 't-dec-3', monthId: '2026-12', description: 'Monitor Ultrawide (3/4)', amount: 350, category: 'lazer', type: 'parcelado', method: 'nubank', status: 'pendente', installmentInfo: 'Parcela 3/4', dueDate: '10/12/2026' },
      { id: 't-dec-4', monthId: '2026-12', description: 'Passagem Aérea Férias (2/3)', amount: 480, category: 'lazer', type: 'parcelado', method: 'itau', status: 'pendente', installmentInfo: 'Parcela 2/3', dueDate: '20/12/2026' },
      { id: 't-dec-5', monthId: '2026-12', description: 'Farmácia & Exames (2/2)', amount: 165, category: 'essencial', type: 'parcelado', method: 'itau', status: 'pendente', installmentInfo: 'Parcela 2/2', dueDate: '20/12/2026' },

      { id: 't-jan-1', monthId: '2027-01', description: 'Aluguel + Condomínio', amount: 1450, category: 'essencial', type: 'fixo', method: 'conta', status: 'pendente', dueDate: '05/01/2027' },
      { id: 't-jan-2', monthId: '2027-01', description: 'Internet Fibra + Energia', amount: 240, category: 'essencial', type: 'fixo', method: 'conta', status: 'pendente', dueDate: '12/01/2027' },
      { id: 't-jan-3', monthId: '2027-01', description: 'Monitor Ultrawide (4/4)', amount: 350, category: 'lazer', type: 'parcelado', method: 'nubank', status: 'pendente', installmentInfo: 'Parcela 4/4', dueDate: '10/01/2027' },
      { id: 't-jan-4', monthId: '2027-01', description: 'Passagem Aérea Férias (3/3)', amount: 480, category: 'lazer', type: 'parcelado', method: 'itau', status: 'pendente', installmentInfo: 'Parcela 3/3', dueDate: '20/01/2027' },
    ],
    goals: [
      { id: 'g-1', name: 'Reserva de Emergência', current: 8400, target: 15000, icon: 'shield' },
      { id: 'g-2', name: 'Viagem Férias 2027', current: 2150, target: 5000, icon: 'plane' },
      { id: 'g-3', name: 'Setup & Projetos', current: 1800, target: 6500, icon: 'laptop' },
    ],
  },

  'profile-vo-maria': {
    id: 'profile-vo-maria',
    name: 'Vó Maria',
    role: 'Familiar • Aposentadoria',
    avatarTheme: 'amber',
    monthlyIncome: 3200,
    rule: { essencial: 65, lazer: 15, investimento: 20 },
    transactions: [
      { id: 'vm-nov-1', monthId: '2026-11', description: 'Plano de Saúde Sênior', amount: 780, category: 'essencial', type: 'fixo', method: 'conta', status: 'pago', dueDate: '05/11/2026' },
      { id: 'vm-nov-2', monthId: '2026-11', description: 'Água, Luz, Gás & IPTU', amount: 410, category: 'essencial', type: 'fixo', method: 'conta', status: 'pago', dueDate: '10/11/2026' },
      { id: 'vm-nov-3', monthId: '2026-11', description: 'Farmácia Uso Contínuo', amount: 340, category: 'essencial', type: 'avista', method: 'conta', status: 'pago', dueDate: '12/11/2026' },
      { id: 'vm-nov-4', monthId: '2026-11', description: 'Supermercado & Açougue', amount: 520, category: 'essencial', type: 'avista', method: 'nubank', status: 'pago', dueDate: '10/11/2026' },
      { id: 'vm-nov-5', monthId: '2026-11', description: 'Poltrona Reclinável Sala (2/4)', amount: 280, category: 'lazer', type: 'parcelado', method: 'itau', status: 'pendente', installmentInfo: 'Parcela 2/4', dueDate: '20/11/2026' },
      { id: 'vm-nov-6', monthId: '2026-11', description: 'Exame Oftalmológico (1/2)', amount: 150, category: 'essencial', type: 'parcelado', method: 'itau', status: 'pendente', installmentInfo: 'Parcela 1/2', dueDate: '20/11/2026' },
      { id: 'vm-nov-7', monthId: '2026-11', description: 'Aporte Reserva Médica', amount: 500, category: 'investimento', type: 'investimento', method: 'conta', status: 'pago', dueDate: '04/11/2026' },

      { id: 'vm-dec-1', monthId: '2026-12', description: 'Plano de Saúde Sênior', amount: 780, category: 'essencial', type: 'fixo', method: 'conta', status: 'pendente', dueDate: '05/12/2026' },
      { id: 'vm-dec-2', monthId: '2026-12', description: 'Água, Luz, Gás & IPTU', amount: 410, category: 'essencial', type: 'fixo', method: 'conta', status: 'pendente', dueDate: '10/12/2026' },
      { id: 'vm-dec-3', monthId: '2026-12', description: 'Poltrona Reclinável Sala (3/4)', amount: 280, category: 'lazer', type: 'parcelado', method: 'itau', status: 'pendente', installmentInfo: 'Parcela 3/4', dueDate: '20/12/2026' },
      { id: 'vm-dec-4', monthId: '2026-12', description: 'Exame Oftalmológico (2/2)', amount: 150, category: 'essencial', type: 'parcelado', method: 'itau', status: 'pendente', installmentInfo: 'Parcela 2/2', dueDate: '20/12/2026' },

      { id: 'vm-jan-1', monthId: '2027-01', description: 'Plano de Saúde Sênior', amount: 780, category: 'essencial', type: 'fixo', method: 'conta', status: 'pendente', dueDate: '05/01/2027' },
      { id: 'vm-jan-2', monthId: '2027-01', description: 'Poltrona Reclinável Sala (4/4)', amount: 280, category: 'lazer', type: 'parcelado', method: 'itau', status: 'pendente', installmentInfo: 'Parcela 4/4', dueDate: '20/01/2027' },
    ],
    goals: [
      { id: 'vm-g1', name: 'Reserva Médica & Emergência', current: 6200, target: 10000, icon: 'medical' },
      { id: 'vm-g2', name: 'Reforma & Pintura Casa', current: 1450, target: 4000, icon: 'home' },
    ],
  },
};

// Dados iniciais da conta do irmão (Lucas) - 100% isolados da conta do Pedro
const INITIAL_LUCAS_PROFILES = {
  'profile-lucas': {
    id: 'profile-lucas',
    name: 'Lucas',
    role: 'Pessoal',
    avatarTheme: 'cyan',
    monthlyIncome: 3800,
    rule: { essencial: 50, lazer: 30, investimento: 20 },
    transactions: [
      { id: 'lc-nov-1', monthId: '2026-11', description: 'Aluguel República / Studio', amount: 1150, category: 'essencial', type: 'fixo', method: 'conta', status: 'pago', dueDate: '05/11/2026' },
      { id: 'lc-nov-2', monthId: '2026-11', description: 'Mercado & Delivery', amount: 490, category: 'essencial', type: 'avista', method: 'conta', status: 'pago', dueDate: '09/11/2026' },
      { id: 'lc-nov-3', monthId: '2026-11', description: 'Console & Jogos (1/3)', amount: 320, category: 'lazer', type: 'parcelado', method: 'nubank', status: 'pendente', installmentInfo: 'Parcela 1/3', dueDate: '10/11/2026' },
      { id: 'lc-nov-4', monthId: '2026-11', description: 'Academia & Suplementos', amount: 190, category: 'lazer', type: 'fixo', method: 'nubank', status: 'pendente', dueDate: '10/11/2026' },
      { id: 'lc-nov-5', monthId: '2026-11', description: 'Aporte Meta Troca de Moto', amount: 760, category: 'investimento', type: 'investimento', method: 'conta', status: 'pago', dueDate: '04/11/2026' },

      { id: 'lc-dec-1', monthId: '2026-12', description: 'Aluguel República / Studio', amount: 1150, category: 'essencial', type: 'fixo', method: 'conta', status: 'pendente', dueDate: '05/12/2026' },
      { id: 'lc-dec-2', monthId: '2026-12', description: 'Console & Jogos (2/3)', amount: 320, category: 'lazer', type: 'parcelado', method: 'nubank', status: 'pendente', installmentInfo: 'Parcela 2/3', dueDate: '10/12/2026' },
      { id: 'lc-dec-3', monthId: '2026-12', description: 'Academia & Suplementos', amount: 190, category: 'lazer', type: 'fixo', method: 'nubank', status: 'pendente', dueDate: '10/12/2026' },

      { id: 'lc-jan-1', monthId: '2027-01', description: 'Aluguel República / Studio', amount: 1150, category: 'essencial', type: 'fixo', method: 'conta', status: 'pendente', dueDate: '05/01/2027' },
      { id: 'lc-jan-2', monthId: '2027-01', description: 'Console & Jogos (3/3)', amount: 320, category: 'lazer', type: 'parcelado', method: 'nubank', status: 'pendente', installmentInfo: 'Parcela 3/3', dueDate: '10/01/2027' },
    ],
    goals: [
      { id: 'lc-g1', name: 'Reserva de Emergência', current: 3100, target: 9000, icon: 'shield' },
      { id: 'lc-g2', name: 'Troca de Moto', current: 4500, target: 14000, icon: 'laptop' },
    ],
  },
};

// Banco inicial de contas de usuário (cada conta guarda apenas seus próprios perfis e data real de cadastro)
const INITIAL_ACCOUNTS = {
  'pedro@finflow.app': {
    email: 'pedro@finflow.app',
    name: 'Pedro',
    password: '123',
    createdAt: '2026-11-17T10:00:00.000Z',
    createdMonthId: '2026-11',
    lastLoginAt: '2026-11-17T14:00:00.000Z',
    profiles: INITIAL_PROFILES_DATA,
  },
  'lucas@finflow.app': {
    email: 'lucas@finflow.app',
    name: 'Lucas',
    password: '123',
    createdAt: '2026-11-17T10:00:00.000Z',
    createdMonthId: '2026-11',
    lastLoginAt: '2026-11-17T14:00:00.000Z',
    profiles: INITIAL_LUCAS_PROFILES,
  },
};

// Utilitário de formatação BRL
const formatBRL = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
};

const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const csvSafe = (v) => (/^[=+\-@]/.test(String(v)) ? `'${v}` : String(v));

export default function App() {
  // Banco de contas persistido em localStorage
  const [accounts, setAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback para dados iniciais caso o localStorage esteja bloqueado
    }
    return INITIAL_ACCOUNTS;
  });

  // Conta autenticada atualmente (null = exibe Tela de Login / Cadastro)
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  // Estados da Tela de Autenticação
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register' | 'forgot'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', newPassword: '' });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Gerenciamento Multiperfil dentro da conta logada
  const [activeProfileId, setActiveProfileId] = useState(null); // null = exibe tela inicial "Quem está gerenciando?"
  const [showNewProfileModal, setShowNewProfileModal] = useState(false);
  const [newProfileForm, setNewProfileForm] = useState({
    name: '',
    role: 'Familiar',
    avatarTheme: 'violet',
    monthlyIncome: '3000',
  });

  // Estados de navegação e modais do Dashboard
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(() => Math.max(0, AVAILABLE_MONTHS.findIndex((m) => m.id === getCurrentMonthId())));
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [tempIncome, setTempIncome] = useState('4500');
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleDraft, setRuleDraft] = useState(null);
  const openRuleModal = () => {
    setRuleDraft({ ...rule });
    setShowRuleModal(true);
  };

  // Estados do Modal de Extrato por Período & Exportação
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [statementStartIdx, setStatementStartIdx] = useState(0); // Inicia a partir do mês de cadastro da conta
  const [statementEndIdx, setStatementEndIdx] = useState(0);
  const [statementCategoryFilter, setStatementCategoryFilter] = useState('todos');

  // Filtros e Modais
  const [activeFilter, setActiveFilter] = useState('todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [depositGoalModal, setDepositGoalModal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('200');
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [newGoalForm, setNewGoalForm] = useState({ name: '', target: '5000', icon: 'shield' });
  const [toastMessage, setToastMessage] = useState(null);

  // Sincroniza alterações no localStorage
  const persistAccounts = (updaterFn) => {
    setAccounts((prev) => {
      const next = updaterFn(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignora erro de quota
      }
      return next;
    });
  };

  // Conta logada e seus perfis isolados
  const currentAccount = currentUserEmail ? accounts[currentUserEmail] : null;
  const profiles = currentAccount?.profiles || {};

  // Índice real do mês em que a conta foi criada (marco inicial verdadeiro do histórico do usuário)
  const accountOriginMonthIdx = useMemo(() => {
    if (!currentAccount?.createdMonthId) return 0;
    const foundIdx = AVAILABLE_MONTHS.findIndex((m) => m.id === currentAccount.createdMonthId);
    return foundIdx >= 0 ? foundIdx : 0;
  }, [currentAccount]);

  const accountOriginMonth = AVAILABLE_MONTHS[accountOriginMonthIdx] || AVAILABLE_MONTHS[0];

  // Formata data/hora real do último acesso ou cadastro
  const formattedLastLogin = useMemo(() => {
    const rawDate = currentAccount?.lastLoginAt || currentAccount?.createdAt;
    if (!rawDate) return new Date().toLocaleDateString('pt-BR');
    const parsed = new Date(rawDate);
    return `${parsed.toLocaleDateString('pt-BR')} às ${parsed.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }, [currentAccount]);

  // Perfil ativo atual
  const activeProfile = activeProfileId ? profiles[activeProfileId] : null;

  // Estado do Formulário de Novo Lançamento
  const [formState, setFormState] = useState({
    type: 'parcelado',
    description: '',
    amount: '',
    installments: 3,
    category: 'lazer',
    method: 'nubank',
    status: 'pendente',
    goalId: '',
  });

  const currentMonth = AVAILABLE_MONTHS[selectedMonthIdx];

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Login ou Cadastro de Conta
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    const normalizedEmail = authForm.email.trim().toLowerCase();
    const cleanPass = authForm.password.trim();

    if (!normalizedEmail) {
      setAuthError('Preencha o e-mail para continuar.');
      return;
    }

    if (authTab === 'forgot') {
      const found = accounts[normalizedEmail];
      if (!found) {
        setAuthError('Não encontramos nenhuma conta cadastrada com este e-mail.');
        return;
      }
      const newPassClean = authForm.newPassword.trim();
      if (!newPassClean || newPassClean.length < 3) {
        setAuthError('Digite uma nova senha válida com pelo menos 3 caracteres.');
        return;
      }

      persistAccounts((prev) => ({
        ...prev,
        [normalizedEmail]: {
          ...prev[normalizedEmail],
          password: newPassClean,
        },
      }));

      setAuthSuccess('Senha redefinida com sucesso! Agora você já pode entrar com sua nova senha.');
      setAuthForm({ name: '', email: '', password: '', newPassword: '' });
      setTimeout(() => {
        setAuthTab('login');
        setAuthSuccess('');
      }, 2500);
      return;
    }

    if (!cleanPass) {
      setAuthError('Preencha a senha para continuar.');
      return;
    }

    if (authTab === 'login') {
      const found = accounts[normalizedEmail];
      if (!found || found.password !== cleanPass) {
        setAuthError('E-mail ou senha inválidos. Se esqueceu sua senha, clique em "Esqueci minha senha".');
        return;
      }

      const nowIso = new Date().toISOString();
      persistAccounts((prev) => ({
        ...prev,
        [normalizedEmail]: {
          ...prev[normalizedEmail],
          createdAt: prev[normalizedEmail].createdAt || nowIso,
          createdMonthId: prev[normalizedEmail].createdMonthId || getCurrentMonthId(),
          lastLoginAt: nowIso,
        },
      }));

      setCurrentUserEmail(normalizedEmail);
      setActiveProfileId(null);
      setAuthForm({ name: '', email: '', password: '', newPassword: '' });
      triggerToast(`Bem-vindo de volta, ${found.name}!`);
    } else {
      const cleanName = authForm.name.trim();
      if (!cleanName) {
        setAuthError('Informe seu nome para criar a conta.');
        return;
      }
      if (accounts[normalizedEmail]) {
        setAuthError('Este e-mail já possui uma conta. Faça login na aba "Entrar na Conta".');
        return;
      }

      const nowIso = new Date().toISOString();
      const originMonth = getCurrentMonthId();
      const initialProfileId = `profile-${Date.now()}`;
      const newAccountObj = {
        email: normalizedEmail,
        name: cleanName,
        password: cleanPass,
        createdAt: nowIso,
        createdMonthId: originMonth,
        lastLoginAt: nowIso,
        profiles: {
          [initialProfileId]: {
            id: initialProfileId,
            name: cleanName,
            role: 'Meu Controle',
            avatarTheme: 'emerald',
            monthlyIncome: 3500,
            rule: { essencial: 50, lazer: 30, investimento: 20 },
            transactions: [],
            goals: [
              {
                id: `goal-${Date.now()}`,
                name: 'Reserva de Emergência',
                current: 0,
                target: 10000,
                icon: 'shield',
              },
            ],
          },
        },
      };

      persistAccounts((prev) => ({
        ...prev,
        [normalizedEmail]: newAccountObj,
      }));

      setCurrentUserEmail(normalizedEmail);
      setActiveProfileId(null);
      setAuthForm({ name: '', email: '', password: '', newPassword: '' });
      triggerToast(`Conta criada! Ambiente isolado pronto para ${cleanName}.`);
    }
  };

  // Logout completo (volta para a tela de Login)
  const handleLogoutAccount = () => {
    setActiveProfileId(null);
    setCurrentUserEmail(null);
    setIsEditingIncome(false);
    setActiveFilter('todos');
  };

  // Helper para atualizar dados apenas do perfil ativo dentro da conta logada
  const updateActiveProfile = (updaterFn) => {
    if (!currentUserEmail || !activeProfileId) return;
    persistAccounts((prev) => {
      const userAcc = prev[currentUserEmail];
      if (!userAcc || !userAcc.profiles[activeProfileId]) return prev;
      return {
        ...prev,
        [currentUserEmail]: {
          ...userAcc,
          profiles: {
            ...userAcc.profiles,
            [activeProfileId]: updaterFn(userAcc.profiles[activeProfileId]),
          },
        },
      };
    });
  };

  // Selecionar um perfil e preparar estados locais
  const handleSelectProfile = (profileId) => {
    const target = profiles[profileId];
    if (!target) return;
    setActiveProfileId(profileId);
    setActiveFilter('todos');
    setIsEditingIncome(false);
    setFormState((prev) => ({
      ...prev,
      goalId: target.goals[0]?.id || '',
    }));
  };

  // Criar novo perfil vinculado exclusivamente à conta logada
  const handleCreateProfile = (e) => {
    e.preventDefault();
    if (!currentUserEmail) return;
    const cleanName = newProfileForm.name.trim();
    const incomeVal = parseFloat(String(newProfileForm.monthlyIncome).replace(',', '.'));
    if (!cleanName || isNaN(incomeVal) || incomeVal <= 0) return;

    const newId = `profile-${Date.now()}`;
    const defaultGoalId = `goal-${Date.now()}`;

    const createdProfile = {
      id: newId,
      name: cleanName,
      role: newProfileForm.role.trim() || 'Controle Pessoal',
      avatarTheme: newProfileForm.avatarTheme,
      monthlyIncome: incomeVal,
      rule: { essencial: 50, lazer: 30, investimento: 20 },
      transactions: [],
      goals: [
        {
          id: defaultGoalId,
          name: 'Reserva Principal',
          current: 0,
          target: Math.round(incomeVal * 3),
          icon: 'shield',
        },
      ],
    };

    persistAccounts((prev) => {
      const userAcc = prev[currentUserEmail];
      return {
        ...prev,
        [currentUserEmail]: {
          ...userAcc,
          profiles: {
            ...userAcc.profiles,
            [newId]: createdProfile,
          },
        },
      };
    });

    setShowNewProfileModal(false);
    setNewProfileForm({
      name: '',
      role: 'Familiar',
      avatarTheme: 'violet',
      monthlyIncome: '3000',
    });
    handleSelectProfile(newId);
    triggerToast(`Perfil "${cleanName}" criado na conta ${currentAccount.name}!`);
  };

  // Criar nova caixinha no perfil ativo
  const handleCreateGoal = (e) => {
    e.preventDefault();
    const cleanName = newGoalForm.name.trim();
    const targetVal = parseFloat(String(newGoalForm.target).replace(',', '.'));
    if (!cleanName || isNaN(targetVal) || targetVal <= 0) return;

    const newGoalObj = {
      id: `goal-${Date.now()}`,
      name: cleanName,
      current: 0,
      target: targetVal,
      icon: newGoalForm.icon,
    };

    updateActiveProfile((prof) => ({
      ...prof,
      goals: [...prof.goals, newGoalObj],
    }));

    setShowNewGoalModal(false);
    setNewGoalForm({ name: '', target: '5000', icon: 'shield' });
    triggerToast(`Caixinha "${cleanName}" criada!`);
  };

  // Dados derivados do perfil ativo (seguros mesmo quando activeProfile é null)
  const monthlyIncome = activeProfile?.monthlyIncome || 0;
  const rule = activeProfile?.rule || { essencial: 50, lazer: 30, investimento: 20 };
  const transactions = activeProfile?.transactions || [];
  const goals = activeProfile?.goals || [];

  // Transações filtradas pelo mês selecionado
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.monthId === currentMonth.id);
  }, [transactions, currentMonth.id]);

  // Cálculos financeiros do mês selecionado
  const summary = useMemo(() => {
    let totalExpenses = 0;
    let paidExpenses = 0;
    let pendingExpenses = 0;
    let essentialSpent = 0;
    let leisureSpent = 0;
    let investedAmount = 0;

    monthTransactions.forEach((t) => {
      if (t.category === 'investimento') {
        investedAmount += t.amount;
      } else {
        totalExpenses += t.amount;
        if (t.status === 'pago') paidExpenses += t.amount;
        else pendingExpenses += t.amount;

        if (t.category === 'essencial') essentialSpent += t.amount;
        if (t.category === 'lazer') leisureSpent += t.amount;
      }
    });

    const freeBalance = monthlyIncome - totalExpenses - investedAmount;

    return {
      totalExpenses,
      paidExpenses,
      pendingExpenses,
      essentialSpent,
      leisureSpent,
      investedAmount,
      freeBalance,
    };
  }, [monthTransactions, monthlyIncome]);

  // Cálculo dinâmico de faturas de cartão do mês selecionado
  const cardInvoices = useMemo(() => {
    const cards = ['nubank', 'itau'];
    return cards
      .map((cardId) => {
        const meta = PAYMENT_METHODS.find((m) => m.id === cardId);
        const cardItems = monthTransactions.filter((t) => t.method === cardId && t.category !== 'investimento');
        const total = cardItems.reduce((acc, item) => acc + item.amount, 0);
        const pendingItems = cardItems.filter((t) => t.status === 'pendente');
        const pendingTotal = pendingItems.reduce((acc, item) => acc + item.amount, 0);

        return {
          ...meta,
          total,
          pendingTotal,
          itemCount: cardItems.length,
          isPaid: cardItems.length > 0 && pendingItems.length === 0,
        };
      })
      .filter((c) => c.total > 0);
  }, [monthTransactions]);

  // Marcar fatura inteira de um cartão no mês como paga
  const handlePayInvoice = (cardId, cardName) => {
    updateActiveProfile((prof) => ({
      ...prof,
      transactions: prof.transactions.map((t) =>
        t.monthId === currentMonth.id && t.method === cardId && t.status === 'pendente'
          ? { ...t, status: 'pago' }
          : t
      ),
    }));
    triggerToast(`Fatura do ${cardName} (${currentMonth.label}) marcada como paga!`);
  };

  // Alternar status individual Pago / Pendente
  const toggleTransactionStatus = (id) => {
    updateActiveProfile((prof) => ({
      ...prof,
      transactions: prof.transactions.map((t) =>
        t.id === id ? { ...t, status: t.status === 'pago' ? 'pendente' : 'pago' } : t
      ),
    }));
  };

  // Excluir lançamento
  const deleteTransaction = (id) => {
    if (!window.confirm('Excluir este lançamento?')) return;
    updateActiveProfile((prof) => {
      const tx = prof.transactions.find((t) => t.id === id);
      return {
        ...prof,
        goals: tx?.goalId
          ? prof.goals.map((g) => (g.id === tx.goalId ? { ...g, current: Math.max(0, g.current - tx.amount) } : g))
          : prof.goals,
        transactions: prof.transactions.filter((t) => t.id !== id),
      };
    });
    triggerToast('Lançamento removido.');
  };

  // Salvar edição de renda
  const handleSaveIncome = (e) => {
    e.preventDefault();
    const val = parseFloat(tempIncome.replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      updateActiveProfile((prof) => ({
        ...prof,
        monthlyIncome: val,
      }));
      triggerToast(`Renda mensal de ${activeProfile.name} atualizada para ${formatBRL(val)}`);
    }
    setIsEditingIncome(false);
  };

  // Criar Novo Lançamento
  const handleCreateTransaction = (e) => {
    e.preventDefault();
    const numericAmount = parseFloat(String(formState.amount).replace(',', '.'));
    if (!formState.description.trim() || isNaN(numericAmount) || numericAmount <= 0) {
      return;
    }

    const newEntries = [];
    const baseTimestamp = Date.now();

    if (formState.type === 'parcelado') {
      const count = Math.max(1, Math.min(12, Number(formState.installments) || 1));
      if (selectedMonthIdx + count > AVAILABLE_MONTHS.length) {
        triggerToast('As parcelas ultrapassam o último mês disponível.');
        return;
      }
      const totalCents = Math.round(numericAmount * 100);
      const baseCents = Math.floor(totalCents / count);
      const remainderCents = totalCents - baseCents * count;
      const methodMeta = PAYMENT_METHODS.find((m) => m.id === formState.method);
      const day = methodMeta?.dueDay ? String(methodMeta.dueDay).padStart(2, '0') : '10';

      for (let i = 0; i < count; i++) {
        const targetMonthIdx = selectedMonthIdx + i;
        if (targetMonthIdx < AVAILABLE_MONTHS.length) {
          const mObj = AVAILABLE_MONTHS[targetMonthIdx];
          const [year, month] = mObj.id.split('-');
          newEntries.push({
            id: `tx-${baseTimestamp}-${i}`,
            monthId: mObj.id,
            description: `${formState.description.trim()} (${i + 1}/${count})`,
            amount: (baseCents + (i === 0 ? remainderCents : 0)) / 100,
            category: formState.category,
            type: 'parcelado',
            method: formState.method,
            status: i === 0 ? formState.status : 'pendente',
            installmentInfo: `Parcela ${i + 1}/${count}`,
            dueDate: `${day}/${month}/${year}`,
          });
        }
      }
      triggerToast(`Compra parcelada em ${count}x lançada nos próximos meses!`);
    } else if (formState.type === 'fixo') {
      for (let i = selectedMonthIdx; i < AVAILABLE_MONTHS.length; i++) {
        const mObj = AVAILABLE_MONTHS[i];
        const [year, month] = mObj.id.split('-');
        newEntries.push({
          id: `tx-${baseTimestamp}-${i}`,
          monthId: mObj.id,
          description: formState.description.trim(),
          amount: numericAmount,
          category: formState.category,
          type: 'fixo',
          method: formState.method,
          status: i === selectedMonthIdx ? formState.status : 'pendente',
          dueDate: `05/${month}/${year}`,
        });
      }
      triggerToast('Gasto fixo recorrente projetado para os próximos meses!');
    } else if (formState.type === 'investimento') {
      const [year, month] = currentMonth.id.split('-');
      newEntries.push({
        id: `tx-${baseTimestamp}`,
        monthId: currentMonth.id,
        description: formState.description.trim(),
        amount: numericAmount,
        category: 'investimento',
        type: 'investimento',
        method: 'conta',
        status: 'pago',
        dueDate: `17/${month}/${year}`,
      });

      const targetGoalId = formState.goalId || goals[0]?.id;
      newEntries[0].goalId = targetGoalId;
      updateActiveProfile((prof) => ({
        ...prof,
        transactions: [...newEntries, ...prof.transactions],
        goals: prof.goals.map((g) =>
          g.id === targetGoalId ? { ...g, current: g.current + numericAmount } : g
        ),
      }));

      triggerToast(`Aporte de ${formatBRL(numericAmount)} registrado na caixinha!`);
      setShowAddModal(false);
      setFormState({
        type: 'parcelado',
        description: '',
        amount: '',
        installments: 3,
        category: 'lazer',
        method: 'nubank',
        status: 'pendente',
        goalId: goals[0]?.id || '',
      });
      return;
    } else {
      const [year, month] = currentMonth.id.split('-');
      const methodMeta = PAYMENT_METHODS.find((m) => m.id === formState.method);
      const day = methodMeta?.dueDay ? String(methodMeta.dueDay).padStart(2, '0') : '17';
      newEntries.push({
        id: `tx-${baseTimestamp}`,
        monthId: currentMonth.id,
        description: formState.description.trim(),
        amount: numericAmount,
        category: formState.category,
        type: 'avista',
        method: formState.method,
        status: formState.status,
        dueDate: `${day}/${month}/${year}`,
      });
      triggerToast('Lançamento adicionado com sucesso!');
    }

    updateActiveProfile((prof) => ({
      ...prof,
      transactions: [...newEntries, ...prof.transactions],
    }));

    setShowAddModal(false);
    setFormState({
      type: 'parcelado',
      description: '',
      amount: '',
      installments: 3,
      category: 'lazer',
      method: 'nubank',
      status: 'pendente',
      goalId: goals[0]?.id || '',
    });
  };

  // Aporte rápido direto pelo card da Caixinha
  const handleQuickGoalDeposit = (e) => {
    e.preventDefault();
    if (!depositGoalModal) return;
    const val = parseFloat(String(depositAmount).replace(',', '.'));
    if (isNaN(val) || val <= 0) return;

    const [year, month] = currentMonth.id.split('-');
    const newTx = {
      id: `tx-goal-${Date.now()}`,
      goalId: depositGoalModal.id,
      monthId: currentMonth.id,
      description: `Aporte: ${depositGoalModal.name}`,
      amount: val,
      category: 'investimento',
      type: 'investimento',
      method: 'conta',
      status: 'pago',
      dueDate: `17/${month}/${year}`,
    };

    updateActiveProfile((prof) => ({
      ...prof,
      goals: prof.goals.map((g) =>
        g.id === depositGoalModal.id ? { ...g, current: g.current + val } : g
      ),
      transactions: [newTx, ...prof.transactions],
    }));

    triggerToast(`+${formatBRL(val)} guardado em "${depositGoalModal.name}"!`);
    setDepositGoalModal(null);
    setDepositAmount('200');
  };

  // Lista filtrada para exibição na tabela/lista
  const displayedTransactions = useMemo(() => {
    return monthTransactions.filter((t) => {
      if (activeFilter === 'todos') return true;
      if (activeFilter === 'pagos') return t.status === 'pago';
      if (activeFilter === 'pendentes') return t.status === 'pendente';
      if (activeFilter === 'cartao') return (t.method === 'nubank' || t.method === 'itau') && t.category !== 'investimento';
      if (activeFilter === 'fixos') return t.method === 'conta' && t.category !== 'investimento';
      if (activeFilter === 'investimentos') return t.category === 'investimento';
      return true;
    });
  }, [monthTransactions, activeFilter]);

  // ============================================================================
  // LÓGICA DO EXTRATO POR PERÍODO & EXPORTAÇÃO (CSV / IMPRESSÃO PDF)
  // ============================================================================
  const statementData = useMemo(() => {
    const startIdx = Math.min(statementStartIdx, statementEndIdx);
    const endIdx = Math.max(statementStartIdx, statementEndIdx);
    const selectedMonthsSlice = AVAILABLE_MONTHS.slice(startIdx, endIdx + 1);
    const validMonthIds = new Set(selectedMonthsSlice.map((m) => m.id));

    const filteredTxs = transactions
      .filter((t) => {
        if (!validMonthIds.has(t.monthId)) return false;
        if (statementCategoryFilter === 'todos') return true;
        return t.category === statementCategoryFilter;
      })
      .sort((a, b) => {
        const idxA = AVAILABLE_MONTHS.findIndex((m) => m.id === a.monthId);
        const idxB = AVAILABLE_MONTHS.findIndex((m) => m.id === b.monthId);
        if (idxA !== idxB) return idxA - idxB;
        return a.dueDate.localeCompare(b.dueDate);
      });

    let totalExpenses = 0;
    let totalEssential = 0;
    let totalLeisure = 0;
    let totalInvested = 0;

    filteredTxs.forEach((t) => {
      if (t.category === 'investimento') {
        totalInvested += t.amount;
      } else {
        totalExpenses += t.amount;
        if (t.category === 'essencial') totalEssential += t.amount;
        if (t.category === 'lazer') totalLeisure += t.amount;
      }
    });

    const monthsCount = selectedMonthsSlice.length;
    const totalIncomePeriod = monthlyIncome * monthsCount;
    const netBalancePeriod = totalIncomePeriod - totalExpenses - totalInvested;

    return {
      startMonth: selectedMonthsSlice[0],
      endMonth: selectedMonthsSlice[selectedMonthsSlice.length - 1],
      monthsCount,
      transactions: filteredTxs,
      totalIncomePeriod,
      totalExpenses,
      totalEssential,
      totalLeisure,
      totalInvested,
      netBalancePeriod,
    };
  }, [transactions, statementStartIdx, statementEndIdx, statementCategoryFilter, monthlyIncome]);

  // Exportar Planilha CSV compatível com Excel PT-BR (BOM UTF-8 + separador ;)
  const handleExportCSV = () => {
    if (!activeProfile) return;

    const headerInfo = [
      `EXTRATO FINANCEIRO CONSOLIDADO - FINFLOW`,
      `Perfil: ${activeProfile.name} (${activeProfile.role})`,
      `Titular da Conta: ${currentAccount?.name || ''} (${currentAccount?.email || ''})`,
      `Início da Conta: ${accountOriginMonth.fullName} | Último Acesso: ${formattedLastLogin}`,
      `Período Consultado: ${statementData.startMonth?.label} até ${statementData.endMonth?.label} (${statementData.monthsCount} ${statementData.monthsCount === 1 ? 'mês' : 'meses'})`,
      `Data de Emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
      ``,
      `RESUMO DO PERÍODO`,
      `Receitas Previstas no Período;R$ ${statementData.totalIncomePeriod.toFixed(2).replace('.', ',')}`,
      `Total de Gastos (Essenciais + Lazer);R$ ${statementData.totalExpenses.toFixed(2).replace('.', ',')}`,
      `Total Investido / Caixinhas;R$ ${statementData.totalInvested.toFixed(2).replace('.', ',')}`,
      `Saldo Líquido do Período;R$ ${statementData.netBalancePeriod.toFixed(2).replace('.', ',')}`,
      ``,
      `Mês Referência;Data Vencimento;Descrição;Categoria;Parcela;Forma de Pagamento;Status;Valor (R$)`,
    ];

    const rows = statementData.transactions.map((t) => {
      const mObj = AVAILABLE_MONTHS.find((m) => m.id === t.monthId);
      const methodMeta = PAYMENT_METHODS.find((m) => m.id === t.method);
      const catLabel =
        t.category === 'essencial'
          ? 'Essencial'
          : t.category === 'lazer'
          ? 'Lazer'
          : 'Investimento';
      const signedVal = t.category === 'investimento' ? t.amount : -t.amount;

      return [
        mObj?.label || t.monthId,
        t.dueDate,
        `"${csvSafe(t.description).replace(/"/g, '""')}"`,
        catLabel,
        t.installmentInfo || (t.type === 'fixo' ? 'Recorrente' : 'À vista'),
        methodMeta?.name || 'Pix / Débito',
        t.status === 'pago' ? 'Pago' : 'Pendente',
        signedVal.toFixed(2).replace('.', ','),
      ].join(';');
    });

    const csvContent = '\uFEFF' + [...headerInfo, ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = activeProfile.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.href = url;
    link.setAttribute(
      'download',
      `extrato_finflow_${safeName}_${statementData.startMonth?.id}_a_${statementData.endMonth?.id}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    triggerToast('Planilha CSV baixada com sucesso!');
  };

  // Imprimir / Salvar PDF em folha A4 limpa (Extrato Bancário Oficial)
  const handlePrintStatement = () => {
    if (!activeProfile) return;

    const printWindow = window.open('', '_blank', 'width=960,height=800');
    if (!printWindow) {
      triggerToast('Permita pop-ups no navegador para abrir a visualização de impressão.');
      return;
    }

    const rowsHtml =
      statementData.transactions.length === 0
        ? `<tr><td colspan="7" style="text-align:center;padding:24px;color:#64748b;">Nenhuma movimentação registrada no período selecionado.</td></tr>`
        : statementData.transactions
            .map((t) => {
              const mObj = AVAILABLE_MONTHS.find((m) => m.id === t.monthId);
              const methodMeta = PAYMENT_METHODS.find((m) => m.id === t.method);
              const catLabel =
                t.category === 'essencial'
                  ? 'Essencial'
                  : t.category === 'lazer'
                  ? 'Lazer'
                  : 'Investimento';
              const isInv = t.category === 'investimento';

              return `
                <tr>
                  <td>${mObj?.label || t.monthId}</td>
                  <td>${t.dueDate}</td>
                  <td><strong>${esc(t.description)}</strong></td>
                  <td>${catLabel}</td>
                  <td>${t.installmentInfo || (t.type === 'fixo' ? 'Fixo' : 'Único')}</td>
                  <td>${methodMeta?.name || 'Conta'} • ${t.status === 'pago' ? 'Pago' : 'Pendente'}</td>
                  <td style="text-align:right;font-weight:700;color:${isInv ? '#0369a1' : '#0f172a'};">
                    ${isInv ? '+' : '-'} ${formatBRL(t.amount)}
                  </td>
                </tr>
              `;
            })
            .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Extrato Financeiro - ${esc(activeProfile.name)}</title>
        <style>
          * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          body { margin: 0; padding: 32px; color: #0f172a; background: #ffffff; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 18px; margin-bottom: 24px; }
          .brand { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #059669; }
          .doc-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 4px; }
          .meta { text-align: right; font-size: 12px; color: #475569; line-height: 1.6; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 26px; }
          .summary-card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 14px; background: #f8fafc; }
          .summary-card span { display: block; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }
          .summary-card strong { display: block; font-size: 16px; margin-top: 4px; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #f1f5f9; color: #334155; text-align: left; padding: 10px 8px; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; font-weight: 700; }
          td { padding: 9px 8px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
          .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; }
          @media print {
            body { padding: 16px; }
            @page { margin: 12mm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">FinFlow • Controle Financeiro</div>
            <div class="doc-title">Extrato Consolidado por Período</div>
            <div style="font-size:13px;color:#334155;margin-top:6px;">
              Perfil Gerenciado: <strong>${esc(activeProfile.name)}</strong> (${esc(activeProfile.role)})
            </div>
          </div>
          <div class="meta">
            <div><strong>Titular:</strong> ${esc(currentAccount?.name || '')}</div>
            <div><strong>Início da Conta:</strong> ${accountOriginMonth.fullName}</div>
            <div><strong>Último Acesso:</strong> ${formattedLastLogin}</div>
            <div><strong>Período:</strong> ${statementData.startMonth?.label} a ${statementData.endMonth?.label} (${statementData.monthsCount} ${statementData.monthsCount === 1 ? 'mês' : 'meses'})</div>
            <div><strong>Emitido em:</strong> ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <span>Receitas Previstas</span>
            <strong style="color:#059669;">${formatBRL(statementData.totalIncomePeriod)}</strong>
          </div>
          <div class="summary-card">
            <span>Gastos Totais</span>
            <strong style="color:#e11d48;">${formatBRL(statementData.totalExpenses)}</strong>
          </div>
          <div class="summary-card">
            <span>Investido / Caixinhas</span>
            <strong style="color:#0284c7;">${formatBRL(statementData.totalInvested)}</strong>
          </div>
          <div class="summary-card">
            <span>Saldo Líquido Período</span>
            <strong>${formatBRL(statementData.netBalancePeriod)}</strong>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Mês</th>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Tipo</th>
              <th>Pagamento / Status</th>
              <th style="text-align:right;">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          <span>Documento gerado eletronicamente via FinFlow</span>
          <span>Regra de Orçamento do Perfil: ${rule.essencial}% Essenciais / ${rule.lazer}% Lazer / ${rule.investimento}% Investimentos</span>
        </div>

        <script>
          window.onload = function() {
            window.focus();
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const planned = {
    essencial: (monthlyIncome * rule.essencial) / 100,
    lazer: (monthlyIncome * rule.lazer) / 100,
    investimento: (monthlyIncome * rule.investimento) / 100,
  };

  const renderGoalIcon = (iconName) => {
    switch (iconName) {
      case 'shield':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'plane':
        return <Plane className="w-5 h-5 text-cyan-400" />;
      case 'laptop':
        return <Laptop className="w-5 h-5 text-violet-400" />;
      case 'medical':
        return <Stethoscope className="w-5 h-5 text-amber-400" />;
      case 'home':
        return <Home className="w-5 h-5 text-rose-400" />;
      default:
        return <PiggyBank className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getAvatarMeta = (themeId) => {
    return PROFILE_AVATARS.find((a) => a.id === themeId) || PROFILE_AVATARS[0];
  };

  // ============================================================================
  // TELA 0: AUTENTICAÇÃO (LOGIN & CRIAR CONTA - ISOLAMENTO POR USUÁRIO)
  // ============================================================================
  if (!currentAccount) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 relative overflow-hidden">
        {/* Efeitos de iluminação de fundo */}
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[320px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none" />

        {/* Header */}
        <header className="max-w-5xl w-full mx-auto flex items-center justify-between pt-2 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Wallet className="w-5 h-5 text-slate-950 stroke-[2.4]" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">FinFlow</span>
          </div>
          <span className="text-xs font-medium text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            Contas 100% Privadas e Isoladas
          </span>
        </header>

        {/* Card Central de Autenticação */}
        <main className="max-w-md w-full mx-auto my-auto py-8 z-10">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-6 h-6 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-extrabold text-white">
                {authTab === 'login'
                  ? 'Acesse sua Conta'
                  : authTab === 'register'
                  ? 'Crie sua Conta Grátis'
                  : 'Redefinir Senha'}
              </h1>
              <p className="text-xs text-slate-400 mt-1.5">
                {authTab === 'forgot'
                  ? 'Informe seu e-mail cadastrado e defina uma nova senha de acesso.'
                  : 'Seus perfis, gastos e caixinhas ficam visíveis apenas quando você entra com seu login.'}
              </p>
            </div>

            {/* Abas Entrar / Criar Conta (ocultas no modo redefinir) */}
            {authTab !== 'forgot' && (
              <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('login');
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    authTab === 'login'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Entrar na Conta
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('register');
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    authTab === 'register'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Criar Nova Conta
                </button>
              </div>
            )}

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{authSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authTab === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Seu Nome
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ex: Mariana Silva"
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="seuemail@exemplo.com"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              {authTab !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Senha</label>
                    {authTab === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthTab('forgot');
                          setAuthError('');
                          setAuthSuccess('');
                        }}
                        className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                      >
                        Esqueci minha senha
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••"
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {authTab === 'forgot' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nova Senha de Acesso
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Digite a nova senha"
                      value={authForm.newPassword}
                      onChange={(e) => setAuthForm({ ...authForm, newPassword: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {authTab === 'login'
                    ? 'Entrar e Ver Meus Perfis'
                    : authTab === 'register'
                    ? 'Criar Conta e Começar'
                    : 'Salvar Nova Senha'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {authTab === 'forgot' && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('login');
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer text-center"
                >
                  Voltar para o Login
                </button>
              )}
            </form>
          </div>
        </main>

        <footer className="max-w-5xl w-full mx-auto text-center text-xs text-slate-500 pb-2 z-10">
          Modo local: os dados ficam salvos apenas neste navegador.
        </footer>
      </div>
    );
  }

  // ============================================================================
  // TELA 1: SELEÇÃO DE PERFIS ("QUEM ESTÁ GERENCIANDO?")
  // ============================================================================
  if (!activeProfile) {
    const profileList = Object.values(profiles);

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 relative overflow-hidden">
        {/* Brilho sutil de fundo */}
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

        {/* Cabeçalho com Conta Logada e Botão Sair da Conta */}
        <header className="max-w-5xl w-full mx-auto flex flex-wrap items-center justify-between gap-3 pt-2 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Wallet className="w-5 h-5 text-slate-950 stroke-[2.4]" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">FinFlow</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Conta: <strong className="text-white">{currentAccount.email}</strong></span>
            </span>

            <button
              onClick={handleLogoutAccount}
              className="text-xs font-semibold text-rose-300 hover:text-white bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/40 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition cursor-pointer"
              title="Encerrar sessão desta conta"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair da Conta</span>
            </button>
          </div>
        </header>

        {/* Seletor Central Estilo Netflix */}
        <main className="max-w-5xl w-full mx-auto my-auto py-12 z-10">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-3">
              Ambiente Privado de {currentAccount.name}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Quem está gerenciando?
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-2.5">
              Apenas os perfis cadastrados na sua conta aparecem aqui. Selecione um para abrir o painel financeiro.
            </p>
          </div>

          {/* Grid de Cards de Perfis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {profileList.map((prof) => {
              const avatar = getAvatarMeta(prof.avatarTheme);
              const novTxs = prof.transactions.filter((t) => t.monthId === getCurrentMonthId());
              const novExpenses = novTxs
                .filter((t) => t.category !== 'investimento')
                .reduce((acc, t) => acc + t.amount, 0);
              const novInvested = novTxs
                .filter((t) => t.category === 'investimento')
                .reduce((acc, t) => acc + t.amount, 0);
              const freeNov = prof.monthlyIncome - novExpenses - novInvested;
              const pendingInvoicesCount = novTxs.filter(
                (t) => (t.method === 'nubank' || t.method === 'itau') && t.status === 'pendente'
              ).length;

              return (
                <button
                  key={prof.id}
                  onClick={() => handleSelectProfile(prof.id)}
                  className="group text-left bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/40 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      {/* Avatar */}
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatar.bg} flex items-center justify-center text-slate-950 font-extrabold text-xl shadow-lg group-hover:scale-105 transition-transform`}
                      >
                        {prof.avatarTheme === 'amber' ? (
                          <HeartHandshake className="w-7 h-7 text-slate-950 stroke-[2.2]" />
                        ) : (
                          prof.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${avatar.badge}`}
                      >
                        {prof.role}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h2 className="text-xl font-bold text-white group-hover:text-emerald-300 transition">
                        {prof.name}
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Renda Base: <strong className="text-slate-200">{formatBRL(prof.monthlyIncome)}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Resumo Rápido no Card */}
                  <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Saldo Livre ({AVAILABLE_MONTHS.find((m) => m.id === getCurrentMonthId())?.label}):</span>
                      <span
                        className={`font-bold ${
                          freeNov >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatBRL(freeNov)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Faturas pendentes:</span>
                      {pendingInvoicesCount > 0 ? (
                        <span className="text-amber-400 font-semibold">
                          {pendingInvoicesCount} {pendingInvoicesCount === 1 ? 'lançamento' : 'lançamentos'}
                        </span>
                      ) : (
                        <span className="text-slate-500">Em dia</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Card "+ Adicionar Perfil" */}
            <button
              onClick={() => setShowNewProfileModal(true)}
              className="group bg-slate-900/30 hover:bg-slate-900/70 border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[235px] cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-900 group-hover:bg-emerald-500/15 border border-slate-800 group-hover:border-emerald-500/40 flex items-center justify-center transition">
                <UserPlus className="w-6 h-6 text-slate-400 group-hover:text-emerald-400 transition" />
              </div>
              <h3 className="text-base font-bold text-slate-200 group-hover:text-white mt-4">
                + Adicionar Perfil
              </h3>
              <p className="text-xs text-slate-500 max-w-[200px] mt-1">
                Gerencie as finanças de outro familiar ou crie uma conta separada
              </p>
            </button>
          </div>
        </main>

        {/* Rodapé */}
        <footer className="max-w-5xl w-full mx-auto text-center text-xs text-slate-500 pb-2 z-10">
          Cada perfil possui lançamentos, cartões, metas e regra 50-30-20 totalmente isolados.
        </footer>

        {/* MODAL: ADICIONAR NOVO PERFIL */}
        {showNewProfileModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Novo Perfil Financeiro</h3>
                  <p className="text-xs text-slate-400">
                    Crie um ambiente isolado para gerenciar outra pessoa
                  </p>
                </div>
                <button
                  onClick={() => setShowNewProfileModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProfile} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nome do Perfil
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mãe, Pai, Casa de Praia..."
                    value={newProfileForm.name}
                    onChange={(e) => setNewProfileForm({ ...newProfileForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Identificação / Papel
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Familiar, Reserva Conjunta..."
                    value={newProfileForm.role}
                    onChange={(e) => setNewProfileForm({ ...newProfileForm, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Renda Mensal Inicial (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="3000"
                    value={newProfileForm.monthlyIncome}
                    onChange={(e) =>
                      setNewProfileForm({ ...newProfileForm, monthlyIncome: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Cor do Avatar
                  </label>
                  <div className="grid grid-cols-4 gap-2.5">
                    {PROFILE_AVATARS.map((av) => (
                      <button
                        type="button"
                        key={av.id}
                        onClick={() => setNewProfileForm({ ...newProfileForm, avatarTheme: av.id })}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                          newProfileForm.avatarTheme === av.id
                            ? 'bg-slate-800 border-emerald-400'
                            : 'bg-slate-950 border-slate-800 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${av.bg}`} />
                        <span className="text-[11px] font-medium text-slate-300">{av.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewProfileModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    Criar e Abrir Perfil
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // TELA 2: DASHBOARD DO PERFIL SELECIONADO
  // ============================================================================
  const activeAvatar = getAvatarMeta(activeProfile.avatarTheme);
  const draftRule = ruleDraft || rule;
  const ruleSum = draftRule.essencial + draftRule.lazer + draftRule.investimento;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 pb-24 md:pb-12">
      {/* Toast Flutuante */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex items-center gap-2.5 bg-slate-900 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl shadow-emerald-950/60 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* TOPBAR / HEADER */}
      <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Logo + Indicador do Perfil Ativo e Botão Trocar Perfil */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                <Wallet className="w-5 h-5 text-slate-950 stroke-[2.4]" />
              </div>

              {/* Pill do Perfil Ativo + Botão Trocar */}
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1 pr-2">
                <div
                  className={`w-7 h-7 rounded-lg bg-gradient-to-br ${activeAvatar.bg} flex items-center justify-center text-slate-950 font-extrabold text-xs shrink-0`}
                >
                  {activeProfile.avatarTheme === 'amber' ? (
                    <HeartHandshake className="w-4 h-4 text-slate-950 stroke-[2.3]" />
                  ) : (
                    activeProfile.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="leading-tight">
                  <span className="text-xs font-bold text-white block">{activeProfile.name}</span>
                  <span className="text-[10px] text-slate-400 block">{activeProfile.role}</span>
                </div>
                <button
                  onClick={() => setActiveProfileId(null)}
                  className="ml-1 flex items-center gap-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 px-2 py-1 rounded-lg transition cursor-pointer"
                  title="Voltar para seleção de perfis desta conta"
                >
                  <Users className="w-3 h-3" />
                  <span>Trocar Perfil</span>
                </button>
              </div>
            </div>

            {/* Botões Mobile: Extrato + Lançar */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => {
                  setStatementStartIdx(selectedMonthIdx);
                  setStatementEndIdx(selectedMonthIdx);
                  setShowStatementModal(true);
                }}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-xs px-3 py-2 rounded-xl transition"
                title="Extrato por Período e Exportação"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Extrato</span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm px-3.5 py-2 rounded-xl transition shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Lançar</span>
              </button>
            </div>
          </div>

          {/* Controles Centrais: Seletor de Mês + Renda Mensal + Ações */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 sm:gap-3">
            {/* Seletor de Mês */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setSelectedMonthIdx((prev) => Math.max(0, prev - 1))}
                disabled={selectedMonthIdx === 0}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition"
                title="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 py-1 flex items-center gap-1.5 min-w-[115px] justify-center">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-sm font-semibold text-white">{currentMonth.label}</span>
              </div>
              <button
                onClick={() => setSelectedMonthIdx((prev) => Math.min(AVAILABLE_MONTHS.length - 1, prev + 1))}
                disabled={selectedMonthIdx === AVAILABLE_MONTHS.length - 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition"
                title="Próximo mês (projeção)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Renda Mensal Editável */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
              {isEditingIncome ? (
                <form onSubmit={handleSaveIncome} className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={tempIncome}
                    onChange={(e) => setTempIncome(e.target.value)}
                    className="w-24 bg-slate-950 border border-emerald-500/50 rounded-lg px-2 py-0.5 text-sm font-semibold text-white focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setTempIncome(String(monthlyIncome));
                    setIsEditingIncome(true);
                  }}
                  className="flex items-center gap-2 text-left group"
                  title="Clique para editar a renda mensal deste perfil"
                >
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block leading-none">
                      Renda ({activeProfile.name})
                    </span>
                    <span className="text-sm font-bold text-emerald-400 group-hover:text-emerald-300 transition">
                      {formatBRL(monthlyIncome)}
                    </span>
                  </div>
                  <Sliders className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition" />
                </button>
              )}
            </div>

            {/* Botão Ajustar Regra 50-30-20 */}
            <button
              onClick={openRuleModal}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium px-3 py-2.5 rounded-xl transition"
              title="Personalizar percentuais de orçamento"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">
                Regra {rule.essencial}/{rule.lazer}/{rule.investimento}
              </span>
            </button>

            {/* Botão Extrato / Exportar Desktop */}
            <button
              onClick={() => {
                setStatementStartIdx(accountOriginMonthIdx);
                setStatementEndIdx(Math.max(accountOriginMonthIdx, selectedMonthIdx));
                setShowStatementModal(true);
              }}
              className="hidden lg:flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition cursor-pointer"
              title="Consultar extrato desde o início da conta, baixar planilha CSV ou imprimir PDF"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Extrato / Exportar</span>
            </button>

            {/* Botão Novo Lançamento Desktop */}
            <button
              onClick={() => setShowAddModal(true)}
              className="hidden lg:flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Novo Lançamento</span>
            </button>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* BANNER DE ALERTA DE FATURAS PRÓXIMAS */}
        {cardInvoices.length > 0 && (
          <section className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900/90 border border-amber-500/30 rounded-2xl p-4 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-bold text-white">
                      Lembrete de Faturas ({activeProfile.name}) — {currentMonth.fullName}
                    </h2>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Soma automática das parcelas
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Acompanhe o fechamento dos cartões para evitar surpresas no saldo livre.
                  </p>
                </div>
              </div>

              {/* Cards das Faturas do Mês */}
              <div className="flex flex-wrap items-center gap-3">
                {cardInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className={`flex items-center justify-between gap-4 px-3.5 py-2.5 rounded-xl border ${
                      inv.isPaid
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <CreditCard className={`w-3.5 h-3.5 ${inv.color}`} />
                        <span className="text-xs font-semibold text-slate-200">{inv.name}</span>
                        <span className="text-[11px] text-slate-500">• Vence dia {inv.dueDay}</span>
                      </div>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-sm font-bold text-white">{formatBRL(inv.total)}</span>
                        <span className="text-[11px] text-slate-400">({inv.itemCount} itens)</span>
                      </div>
                    </div>

                    {inv.isPaid ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Paga
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePayInvoice(inv.id, inv.name)}
                        className="text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg transition shadow-sm cursor-pointer"
                      >
                        Marcar Fatura Paga
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 4 CARDS DE RESUMO FINANCEIRO */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Renda Mensal */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Renda Previsto/Mês</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-white">{formatBRL(monthlyIncome)}</p>
              <p className="text-xs text-slate-500 mt-1">
                Base {rule.essencial}-{rule.lazer}-{rule.investimento}
              </p>
            </div>
          </div>

          {/* Card 2: Total Gasto / Comprometido */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Gastos Comprometidos</span>
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-white">{formatBRL(summary.totalExpenses)}</p>
              <div className="flex items-center gap-2 text-xs mt-1">
                <span className="text-emerald-400">Pago: {formatBRL(summary.paidExpenses)}</span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-400">Falta: {formatBRL(summary.pendingExpenses)}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Investido no Mês */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Guardado / Investido</span>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-cyan-400">{formatBRL(summary.investedAmount)}</p>
              <p className="text-xs text-slate-500 mt-1">
                Meta ({rule.investimento}%): {formatBRL(planned.investimento)}
              </p>
            </div>
          </div>

          {/* Card 4: Saldo Livre Real */}
          <div
            className={`border rounded-2xl p-5 transition ${
              summary.freeBalance >= 0
                ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/30'
                : 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Saldo Livre Real</span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  summary.freeBalance >= 0 ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                }`}
              >
                <Sparkles
                  className={`w-4 h-4 ${summary.freeBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                />
              </div>
            </div>
            <div className="mt-3">
              <p
                className={`text-2xl font-extrabold ${
                  summary.freeBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatBRL(summary.freeBalance)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Já descontando faturas pendentes e aportes
              </p>
            </div>
          </div>
        </section>

        {/* GRID INTERMEDIÁRIO: REGRA 50-30-20 + CAIXINHAS / OBJETIVOS */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Painel Regra 50-30-20 (7 colunas) */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    Orçamento Inteligente ({rule.essencial}-{rule.lazer}-{rule.investimento})
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Teto planejado vs. realizado para <strong>{activeProfile.name}</strong> em {currentMonth.fullName}
                  </p>
                </div>
                <button
                  onClick={openRuleModal}
                  className="text-xs font-medium text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
                >
                  Ajustar %
                </button>
              </div>

              <div className="space-y-5">
                {/* Barra 1: Essenciais */}
                {(() => {
                  const pct = planned.essencial > 0 ? (summary.essentialSpent / planned.essencial) * 100 : 0;
                  const exceeded = summary.essentialSpent > planned.essencial;
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-200">
                            Essenciais ({rule.essencial}%)
                          </span>
                          <span className="text-xs text-slate-500 hidden sm:inline">
                            Moradia, saúde, mercado, contas fixas
                          </span>
                          {exceeded && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              Teto Ultrapassado
                            </span>
                          )}
                        </div>
                        <div className="text-right font-medium">
                          <span className={exceeded ? 'text-rose-400 font-bold' : 'text-white'}>
                            {formatBRL(summary.essentialSpent)}
                          </span>
                          <span className="text-slate-500"> / {formatBRL(planned.essencial)}</span>
                        </div>
                      </div>
                      <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            exceeded ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Barra 2: Lazer e Desejos */}
                {(() => {
                  const pct = planned.lazer > 0 ? (summary.leisureSpent / planned.lazer) * 100 : 0;
                  const exceeded = summary.leisureSpent > planned.lazer;
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-200">
                            Desejos & Lazer ({rule.lazer}%)
                          </span>
                          <span className="text-xs text-slate-500 hidden sm:inline">
                            Compras, viagens, restaurantes
                          </span>
                          {exceeded && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              Acima do Limite
                            </span>
                          )}
                        </div>
                        <div className="text-right font-medium">
                          <span className={exceeded ? 'text-amber-400 font-bold' : 'text-white'}>
                            {formatBRL(summary.leisureSpent)}
                          </span>
                          <span className="text-slate-500"> / {formatBRL(planned.lazer)}</span>
                        </div>
                      </div>
                      <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            exceeded ? 'bg-amber-500' : 'bg-violet-500'
                          }`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Barra 3: Investimentos / Caixinhas */}
                {(() => {
                  const pct =
                    planned.investimento > 0 ? (summary.investedAmount / planned.investimento) * 100 : 0;
                  const reached = summary.investedAmount >= planned.investimento;
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-200">
                            Investimentos & Metas ({rule.investimento}%)
                          </span>
                          {reached && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                              Meta Atingida!
                            </span>
                          )}
                        </div>
                        <div className="text-right font-medium">
                          <span className="text-cyan-400 font-bold">
                            {formatBRL(summary.investedAmount)}
                          </span>
                          <span className="text-slate-500"> / {formatBRL(planned.investimento)}</span>
                        </div>
                      </div>
                      <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Dica: Separe seus {rule.investimento}% logo no início do mês (Pré-investimento).</span>
              <span className="font-semibold text-emerald-400">
                {monthlyIncome > 0
                  ? Math.round(((summary.totalExpenses + summary.investedAmount) / monthlyIncome) * 100)
                  : 0}
                % alocado
              </span>
            </div>
          </div>

          {/* Painel Caixinhas / Separação por Objetivos (5 colunas) */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <PiggyBank className="w-4 h-4 text-emerald-400" />
                    Caixinhas — {activeProfile.name}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Objetivos individuais intocáveis
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    Total: {formatBRL(goals.reduce((acc, g) => acc + g.current, 0))}
                  </span>
                  <button
                    onClick={() => setShowNewGoalModal(true)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Criar nova caixinha"
                  >
                    <FolderPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3.5">
                {goals.map((goal) => {
                  const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
                  return (
                    <div
                      key={goal.id}
                      className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                            {renderGoalIcon(goal.icon)}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-white">{goal.name}</h3>
                            <p className="text-xs text-slate-400">
                              <span className="text-slate-200 font-medium">{formatBRL(goal.current)}</span>{' '}
                              de {formatBRL(goal.target)} ({progress}%)
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setDepositGoalModal(goal);
                            setDepositAmount('200');
                          }}
                          className="flex items-center gap-1 text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg transition cursor-pointer shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Aportar</span>
                        </button>
                      </div>

                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mt-3">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* LISTA DE LANÇAMENTOS E PARCELAS DO MÊS */}
        <section className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-bold text-white">
                Lançamentos & Projeções ({activeProfile.name}) — {currentMonth.fullName}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Clique no status para alternar entre Pago e Pendente, ou navegue pelos meses acima para ver parcelas futuras.
              </p>
            </div>

            {/* Filtros Rápidos */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'pagos', label: 'Pagos' },
                { id: 'pendentes', label: 'Pendentes / Futuros' },
                { id: 'cartao', label: 'Cartão' },
                { id: 'investimentos', label: 'Caixinhas' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                    activeFilter === tab.id
                      ? 'bg-emerald-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {displayedTransactions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
              <Filter className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">Nenhum lançamento encontrado neste filtro</p>
              <p className="text-xs text-slate-500 mt-1">
                Clique em "Novo Lançamento" para adicionar despesas ou compras parceladas para {activeProfile.name}.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {displayedTransactions.map((tx) => {
                const methodMeta = PAYMENT_METHODS.find((m) => m.id === tx.method) || PAYMENT_METHODS[2];
                const isInvestment = tx.category === 'investimento';

                return (
                  <div
                    key={tx.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/20 px-2 rounded-xl transition"
                  >
                    {/* Esquerda: Info Principal */}
                    <div className="flex items-start sm:items-center gap-3">
                      <button
                        onClick={() => toggleTransactionStatus(tx.id)}
                        title="Alternar Pago / Pendente"
                        className={`mt-0.5 sm:mt-0 w-9 h-9 rounded-xl flex items-center justify-center border transition cursor-pointer shrink-0 ${
                          tx.status === 'pago'
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                        }`}
                      >
                        {tx.status === 'pago' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-white">{tx.description}</span>

                          {tx.installmentInfo && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                              {tx.installmentInfo}
                            </span>
                          )}

                          {tx.type === 'fixo' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                              <Repeat className="w-3 h-3 text-emerald-400" />
                              Fixo
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap mt-1 text-xs text-slate-400">
                          <span className={`px-2 py-0.5 rounded-md border text-[11px] font-medium ${methodMeta.badge}`}>
                            {methodMeta.name}
                          </span>
                          <span>• Venc. {tx.dueDate}</span>
                          <span>•</span>
                          <span className="capitalize">
                            {tx.category === 'essencial'
                              ? `Essencial (${rule.essencial}%)`
                              : tx.category === 'lazer'
                              ? `Lazer (${rule.lazer}%)`
                              : `Investimento (${rule.investimento}%)`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Direita: Valor, Status e Excluir */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 pl-12 sm:pl-0">
                      <span
                        className={`text-base font-bold ${
                          isInvestment ? 'text-cyan-400' : 'text-white'
                        }`}
                      >
                        {isInvestment ? '+' : '-'} {formatBRL(tx.amount)}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleTransactionStatus(tx.id)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                            tx.status === 'pago'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                          }`}
                        >
                          {tx.status === 'pago' ? 'Pago' : 'Pendente'}
                        </button>

                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                          title="Excluir lançamento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* MODAL: NOVO LANÇAMENTO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  Novo Lançamento — {activeProfile.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Mês inicial: <span className="text-emerald-400 font-semibold">{currentMonth.fullName}</span>
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="p-6 space-y-4">
              {/* Tipo de Lançamento */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Tipo de Movimentação
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'parcelado', label: 'Parcelado' },
                    { id: 'avista', label: 'À Vista' },
                    { id: 'fixo', label: 'Fixo Mensal' },
                    { id: 'investimento', label: 'Caixinha' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() =>
                        setFormState((prev) => ({
                          ...prev,
                          type: item.id,
                          category:
                            item.id === 'investimento'
                              ? 'investimento'
                              : prev.category === 'investimento'
                              ? 'lazer'
                              : prev.category,
                        }))
                      }
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        formState.type === item.id
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Descrição
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    formState.type === 'parcelado'
                      ? 'Ex: Exame Médico, Eletrodoméstico, Curso...'
                      : formState.type === 'investimento'
                      ? 'Ex: Aporte Mensal Reserva'
                      : 'Ex: Farmácia, Mercado, Conta de Luz...'
                  }
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none"
                />
              </div>

              {/* Valor e Parcelas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {formState.type === 'parcelado' ? 'Valor Total da Compra (R$)' : 'Valor (R$)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={formState.amount}
                    onChange={(e) => setFormState({ ...formState, amount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>

                {formState.type === 'parcelado' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Número de Parcelas
                    </label>
                    <select
                      value={formState.installments}
                      onChange={(e) => setFormState({ ...formState, installments: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                    >
                      {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                        <option key={n} value={n}>
                          {n}x {formState.amount ? `de ${formatBRL(Number(formState.amount) / n)}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : formState.type === 'investimento' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Destino (Caixinha)
                    </label>
                    <select
                      value={formState.goalId || goals[0]?.id || ''}
                      onChange={(e) => setFormState({ ...formState, goalId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                    >
                      {goals.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Status Inicial
                    </label>
                    <select
                      value={formState.status}
                      onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                    >
                      <option value="pendente">Pendente (A vencer)</option>
                      <option value="pago">Já Pago</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Categoria e Forma de Pagamento */}
              {formState.type !== 'investimento' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Categoria (Orçamento)
                    </label>
                    <select
                      value={formState.category}
                      onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                    >
                      <option value="essencial">Essencial ({rule.essencial}%)</option>
                      <option value="lazer">Lazer / Desejos ({rule.lazer}%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Cartão ou Conta
                    </label>
                    <select
                      value={formState.method}
                      onChange={(e) => setFormState({ ...formState, method: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                    >
                      <option value="nubank">Cartão Nubank (Vence dia 10)</option>
                      <option value="itau">Cartão Itaú (Vence dia 20)</option>
                      <option value="conta">Pix / Débito em Conta</option>
                    </select>
                  </div>
                </div>
              )}

              {formState.type === 'parcelado' && (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-xs text-indigo-200 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>
                    As parcelas serão distribuídas automaticamente a partir de <strong>{currentMonth.label}</strong> nos meses seguintes para você prever suas faturas futuras.
                  </span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: APORTE RÁPIDO NA CAIXINHA */}
      {depositGoalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Guardar na Caixinha</h3>
              <button
                onClick={() => setDepositGoalModal(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Perfil: <strong className="text-white">{activeProfile.name}</strong> • Objetivo:{' '}
              <strong className="text-emerald-400">{depositGoalModal.name}</strong>. O valor será somado à meta e contabilizado nos {rule.investimento}% de investimento em <strong>{currentMonth.label}</strong>.
            </p>

            <form onSubmit={handleQuickGoalDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Valor do Aporte (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-base font-bold text-white focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                {[100, 250, 500].map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => setDepositAmount(String(preset))}
                    className="flex-1 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/40 text-xs font-medium text-slate-300"
                  >
                    +R$ {preset}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Confirmar Aporte
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA CAIXINHA / META */}
      {showNewGoalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Nova Caixinha ({activeProfile.name})</h3>
              <button
                onClick={() => setShowNewGoalModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nome do Objetivo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Troca de Carro, Viagem, Reserva..."
                  value={newGoalForm.name}
                  onChange={(e) => setNewGoalForm({ ...newGoalForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Valor Meta (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="5000"
                  value={newGoalForm.target}
                  onChange={(e) => setNewGoalForm({ ...newGoalForm, target: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ícone
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: 'shield', label: 'Reserva' },
                    { id: 'plane', label: 'Viagem' },
                    { id: 'laptop', label: 'Tech' },
                    { id: 'medical', label: 'Saúde' },
                    { id: 'home', label: 'Casa' },
                  ].map((ic) => (
                    <button
                      type="button"
                      key={ic.id}
                      onClick={() => setNewGoalForm({ ...newGoalForm, icon: ic.id })}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                        newGoalForm.icon === ic.id
                          ? 'bg-slate-800 border-emerald-400'
                          : 'bg-slate-950 border-slate-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {renderGoalIcon(ic.id)}
                      <span className="text-[10px] text-slate-300">{ic.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Criar Caixinha
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AJUSTAR REGRA 50-30-20 */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                Orçamento — {activeProfile.name}
              </h3>
              <button
                onClick={() => setShowRuleModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Ajuste os percentuais de acordo com a realidade deste perfil (a soma deve ser 100%).
            </p>

            <div className="space-y-3">
              {[
                { key: 'essencial', label: 'Essenciais (Moradia, Saúde, Contas, Mercado)' },
                { key: 'lazer', label: 'Desejos & Lazer' },
                { key: 'investimento', label: 'Investimentos & Caixinhas' },
              ].map((item) => (
                <div key={item.key} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="text-emerald-400">{draftRule[item.key]}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="80"
                    step="5"
                    value={draftRule[item.key]}
                    onChange={(e) => setRuleDraft({ ...draftRule, [item.key]: Number(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span
                className={`text-xs font-bold ${
                  ruleSum === 100
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                Soma atual: {ruleSum}%
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRuleDraft({ essencial: 50, lazer: 30, investimento: 20 })}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Padrão 50-30-20
                </button>
                <button
                  type="button"
                  disabled={ruleSum !== 100}
                  onClick={() => {
                    updateActiveProfile((prof) => ({ ...prof, rule: draftRule }));
                    setShowRuleModal(false);
                    triggerToast(`Regra de orçamento de ${activeProfile.name} atualizada!`);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 transition cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EXTRATO POR PERÍODO & EXPORTAÇÃO (ESTILO EXTRATO BANCÁRIO) */}
      {showStatementModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Cabeçalho do Modal */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Extrato Financeiro por Período — {activeProfile.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Histórico real desde a criação da conta ({accountOriginMonth.fullName}) • Último acesso: {formattedLastLogin}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowStatementModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Barra de Filtros de Período e Atalhos */}
            <div className="px-6 py-4 bg-slate-950/70 border-b border-slate-800 space-y-3 shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-400">Atalhos de Período:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setStatementStartIdx(selectedMonthIdx);
                      setStatementEndIdx(selectedMonthIdx);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 cursor-pointer"
                  >
                    Mês Selecionado ({currentMonth.label})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatementStartIdx(accountOriginMonthIdx);
                      setStatementEndIdx(Math.max(accountOriginMonthIdx, selectedMonthIdx));
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 cursor-pointer"
                  >
                    Desde o Login Inicial ({accountOriginMonth.label})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatementStartIdx(accountOriginMonthIdx);
                      setStatementEndIdx(AVAILABLE_MONTHS.length - 1);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-300 cursor-pointer"
                  >
                    Início da Conta + Projeção Futura
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Período Inicial
                  </label>
                  <select
                    value={statementStartIdx}
                    onChange={(e) => setStatementStartIdx(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none"
                  >
                    {AVAILABLE_MONTHS.map((m, idx) => (
                      <option key={m.id} value={idx}>
                        {m.fullName} ({m.label})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Período Final
                  </label>
                  <select
                    value={statementEndIdx}
                    onChange={(e) => setStatementEndIdx(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none"
                  >
                    {AVAILABLE_MONTHS.map((m, idx) => (
                      <option key={m.id} value={idx}>
                        {m.fullName} ({m.label})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Filtrar Categoria
                  </label>
                  <select
                    value={statementCategoryFilter}
                    onChange={(e) => setStatementCategoryFilter(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none"
                  >
                    <option value="todos">Todas as Movimentações</option>
                    <option value="essencial">Apenas Essenciais ({rule.essencial}%)</option>
                    <option value="lazer">Apenas Lazer / Desejos ({rule.lazer}%)</option>
                    <option value="investimento">Apenas Investimentos / Caixinhas</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pré-visualização Estilo Extrato Bancário */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Cabeçalho do Documento */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400">
                      Demonstrativo Consolidado
                    </span>
                    <h4 className="text-base font-bold text-white mt-0.5">
                      Perfil: {activeProfile.name} ({activeProfile.role})
                    </h4>
                    <p className="text-xs text-slate-400">
                      Titular: {currentAccount.name} • Período:{' '}
                      <strong className="text-slate-200">
                        {statementData.startMonth?.label} até {statementData.endMonth?.label}
                      </strong>{' '}
                      ({statementData.monthsCount}{' '}
                      {statementData.monthsCount === 1 ? 'mês' : 'meses'})
                    </p>
                  </div>
                  <div className="text-left sm:text-right text-xs text-slate-400 space-y-0.5">
                    <div>
                      Início da Conta: <strong className="text-slate-200">{accountOriginMonth.fullName}</strong>
                    </div>
                    <div>
                      Último Acesso: <strong className="text-emerald-400">{formattedLastLogin}</strong>
                    </div>
                    <div>Lançamentos: {statementData.transactions.length} registros</div>
                  </div>
                </div>

                {/* 4 Indicadores Consolidados do Período */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                    <span className="text-[11px] text-slate-400 block">Receitas do Período</span>
                    <strong className="text-sm sm:text-base font-bold text-emerald-400 mt-0.5 block">
                      {formatBRL(statementData.totalIncomePeriod)}
                    </strong>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                    <span className="text-[11px] text-slate-400 block">Total Gasto</span>
                    <strong className="text-sm sm:text-base font-bold text-rose-400 mt-0.5 block">
                      {formatBRL(statementData.totalExpenses)}
                    </strong>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                    <span className="text-[11px] text-slate-400 block">Investido / Caixinhas</span>
                    <strong className="text-sm sm:text-base font-bold text-cyan-400 mt-0.5 block">
                      {formatBRL(statementData.totalInvested)}
                    </strong>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                    <span className="text-[11px] text-slate-400 block">Saldo Líquido</span>
                    <strong
                      className={`text-sm sm:text-base font-bold mt-0.5 block ${
                        statementData.netBalancePeriod >= 0 ? 'text-white' : 'text-rose-400'
                      }`}
                    >
                      {formatBRL(statementData.netBalancePeriod)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Tabela Detalhada Cronológica */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <th className="py-3 px-3.5 font-semibold">Mês</th>
                        <th className="py-3 px-3.5 font-semibold">Data</th>
                        <th className="py-3 px-3.5 font-semibold">Descrição</th>
                        <th className="py-3 px-3.5 font-semibold">Categoria</th>
                        <th className="py-3 px-3.5 font-semibold">Pagamento</th>
                        <th className="py-3 px-3.5 font-semibold">Status</th>
                        <th className="py-3 px-3.5 font-semibold text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
                      {statementData.transactions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-10 text-center text-slate-500">
                            Nenhuma movimentação encontrada para os filtros selecionados.
                          </td>
                        </tr>
                      ) : (
                        statementData.transactions.map((t) => {
                          const mObj = AVAILABLE_MONTHS.find((m) => m.id === t.monthId);
                          const methodMeta = PAYMENT_METHODS.find((m) => m.id === t.method);
                          const isInv = t.category === 'investimento';

                          return (
                            <tr key={t.id} className="hover:bg-slate-800/30 transition">
                              <td className="py-2.5 px-3.5 font-semibold text-slate-300 whitespace-nowrap">
                                {mObj?.label || t.monthId}
                              </td>
                              <td className="py-2.5 px-3.5 text-slate-400 whitespace-nowrap">
                                {t.dueDate}
                              </td>
                              <td className="py-2.5 px-3.5 font-medium text-white">
                                {t.description}
                              </td>
                              <td className="py-2.5 px-3.5 whitespace-nowrap">
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                    t.category === 'essencial'
                                      ? 'bg-emerald-500/10 text-emerald-300'
                                      : t.category === 'lazer'
                                      ? 'bg-violet-500/10 text-violet-300'
                                      : 'bg-cyan-500/10 text-cyan-300'
                                  }`}
                                >
                                  {t.category === 'essencial'
                                    ? 'Essencial'
                                    : t.category === 'lazer'
                                    ? 'Lazer'
                                    : 'Investimento'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3.5 text-slate-400 whitespace-nowrap">
                                {methodMeta?.name || 'Pix / Débito'}
                              </td>
                              <td className="py-2.5 px-3.5 whitespace-nowrap">
                                <span
                                  className={`text-[11px] font-semibold ${
                                    t.status === 'pago' ? 'text-emerald-400' : 'text-amber-400'
                                  }`}
                                >
                                  {t.status === 'pago' ? 'Pago' : 'Pendente'}
                                </span>
                              </td>
                              <td
                                className={`py-2.5 px-3.5 text-right font-bold whitespace-nowrap ${
                                  isInv ? 'text-cyan-400' : 'text-white'
                                }`}
                              >
                                {isInv ? '+' : '-'} {formatBRL(t.amount)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Rodapé com Ações Reais: CSV, Imprimir/PDF e Fechar */}
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowStatementModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Fechar
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Baixar Planilha (.CSV / Excel)</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintStatement}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Salvar PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}