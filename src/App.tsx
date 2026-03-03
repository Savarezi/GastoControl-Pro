import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, Edit2, X, TrendingDown, Wallet,
  Repeat, LogOut, Target, Flag, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Category, Expense, FixedExpense, CATEGORIES } from './types';
import { cn, formatCurrency } from './utils';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import '../index.css';

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden", className)}>{children}</div>
);

const Button = ({ children, variant = 'primary', ...props }: any) => {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-secondary text-white hover:bg-secondary/90',
    outline: 'border border-border text-text-muted hover:bg-zinc-50',
    ghost: 'text-zinc-400 hover:text-red-500 hover:bg-red-50', 
  };
  return (
    <button className={cn("px-4 py-2 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2", variants[variant as keyof typeof variants] || variants.primary, props.className)} {...props}>
      {children}
    </button>
  );
};

const Modal = ({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <h3 className="font-bold text-lg text-primary">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full"><X size={20} /></button>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  </div>
);

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [salaries, setSalaries] = useState<Record<string, number>>({});
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFixedFormOpen, setIsFixedFormOpen] = useState(false);
  const [isSalaryFormOpen, setIsSalaryFormOpen] = useState(false);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);

  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'Outros' as Category, date: format(new Date(), 'yyyy-MM-dd') });
  const [newFixed, setNewFixed] = useState({ description: '', amount: '', category: 'Moradia' as Category });
  const [newGoal, setNewGoal] = useState({ title: '', target_amount: '', deadline: '' });
  const [salaryInput, setSalaryInput] = useState('');

  const fetchData = async () => {
    if (!session) return;
    const { data: exp } = await supabase.from('expenses').select('*').order('date', { ascending: false });
    if (exp) setExpenses(exp);
    const { data: fix } = await supabase.from('fixed_expenses').select('*');
    if (fix) setFixedExpenses(fix);
    const { data: gls } = await supabase.from('goals').select('*');
    if (gls) setGoals(gls);
    const { data: sal } = await supabase.from('monthly_salaries').select('*');
    if (sal) {
      const map: Record<string, number> = {};
      sal.forEach(s => map[s.month] = s.amount);
      setSalaries(map);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { fetchData(); }, [session, selectedMonth]);

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const handleDeleteExpense = async (id: string) => {
    await supabase.from('expenses').delete().eq('id', id);
    fetchData();
  };

  const handleDeleteFixed = async (id: string) => {
    await supabase.from('fixed_expenses').delete().eq('id', id);
    fetchData();
  };

  const handleDeleteGoal = async (id: string) => {
    await supabase.from('goals').delete().eq('id', id);
    fetchData();
  };

  const handleUpdateGoalStatus = async (id: string, newStatus: string) => {
    await supabase.from('goals').update({ status: newStatus }).eq('id', id);
    fetchData();
  };

  const parseAmount = (val: string) => {
    if (!val) return 0;
    const cleanVal = val.toString().replace(/\./g, '').replace(',', '.');
    return parseFloat(cleanVal) || 0;
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseAmount(newExpense.amount);
    const { error } = await supabase.from('expenses').insert([{ ...newExpense, amount, user_id: session?.user.id }]);
    if (!error) { setIsFormOpen(false); setNewExpense({ description: '', amount: '', category: 'Outros', date: format(new Date(), 'yyyy-MM-dd') }); fetchData(); }
  };

  const handleAddFixed = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseAmount(newFixed.amount);
    const { error } = await supabase.from('fixed_expenses').insert([{ ...newFixed, amount, user_id: session?.user.id }]);
    if (!error) { setIsFixedFormOpen(false); setNewFixed({ description: '', amount: '', category: 'Moradia' }); fetchData(); }
  };

  // FUNÇÃO DE METAS AJUSTADA PARA O SEU SQL, PATRICIA
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseAmount(newGoal.target_amount);
    
    // Deixando o banco usar o DEFAULT 'Não iniciada' que você definiu no SQL
    const goalData = { 
      title: newGoal.title, 
      target_amount: amount, 
      deadline: newGoal.deadline || null, 
      user_id: session?.user.id, 
      current_amount: 0
      // Removi a linha do status para o banco usar o padrão dele sozinho
    };

    const { error } = await supabase.from('goals').insert([goalData]);
    
    if (error) {
      console.error("Erro ao criar meta:", error.message);
      alert("Erro ao criar meta: " + error.message);
    } else { 
      setIsGoalFormOpen(false); 
      setNewGoal({ title: '', target_amount: '', deadline: '' }); 
      fetchData(); 
    }
  };

  const handleUpdateSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseAmount(salaryInput);
    await supabase.from('monthly_salaries').delete().eq('month', selectedMonth).eq('user_id', session?.user.id);
    await supabase.from('monthly_salaries').insert([{ month: selectedMonth, amount, user_id: session?.user.id }]);
    setIsSalaryFormOpen(false); setSalaryInput(''); fetchData();
  };

  const currentMonthDate = parseISO(`${selectedMonth}-01`);
  const currentMonthExpenses = expenses.filter(e => isSameMonth(parseISO(e.date), currentMonthDate));
  const totalFixed = fixedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalVariable = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSpent = totalFixed + totalVariable;
  const currentSalary = salaries[selectedMonth] ?? 0;
  const balance = currentSalary - totalSpent;
  const percentUsed = (totalSpent / (currentSalary || 1)) * 100;

  if (loading) return null;
  if (!session) return <Login />;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-20">
      <header className="bg-white border-b p-6 sticky top-0 z-40 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Wallet className="text-primary" size={28} />
          <h1 className="text-xl font-black text-primary uppercase tracking-tighter">GastoControl</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsFormOpen(true)}><Plus size={18}/> Gasto</Button>
          <Button variant="ghost" onClick={handleLogout} className="p-2 ml-2">
            <LogOut size={20} />
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <Card className={cn(
              "p-8 text-white transition-all duration-700 relative overflow-hidden shadow-2xl", 
              balance < 0 ? "bg-gradient-to-br from-red-600 to-red-800" : 
              balance < (currentSalary * 0.15) ? "bg-gradient-to-br from-orange-500 to-red-500" : 
              "bg-gradient-to-br from-emerald-500 to-teal-600"
            )}>
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Saldo Livre</p>
                    <h2 className="text-5xl font-black mt-2 tracking-tighter">{formatCurrency(balance)}</h2>
                  </div>
                  <button onClick={() => setIsSalaryFormOpen(true)} className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl backdrop-blur-md border border-white/10 transition-all"><Edit2 size={18}/></button>
                </div>
                <div className="mt-10 space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold opacity-80 uppercase text-white/70">Progresso de Gastos</span>
                    <span className="text-2xl font-black">{percentUsed.toFixed(0)}%</span>
                  </div>
                  <div className="relative h-4 bg-black/20 rounded-full overflow-hidden border border-white/10">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(percentUsed, 100)}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-white" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex items-center gap-2"><Repeat size={18} className="text-secondary"/> Contas Fixas</h3>
                <button onClick={() => setIsFixedFormOpen(true)} className="text-secondary hover:bg-secondary/10 p-1 rounded-lg transition-colors"><Plus size={20}/></button>
              </div>
              <div className="space-y-3">
                {fixedExpenses.map(f => (
                  <div key={f.id} className="flex justify-between items-center text-sm border-b border-zinc-50 pb-2 group">
                    <div className="flex flex-col">
                        <span className="text-zinc-500 font-medium">{f.description}</span>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">{f.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{formatCurrency(f.amount)}</span>
                      <button onClick={() => handleDeleteFixed(f.id)} className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-primary border-b pb-4">
                <TrendingDown className="text-red-500"/> Histórico de Gastos
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[10px] font-bold text-zinc-400 uppercase border-b">
                      <th className="pb-4">Data</th>
                      <th className="pb-4">Descrição</th>
                      <th className="pb-4">Categoria</th>
                      <th className="pb-4 text-right">Valor</th>
                      <th className="pb-4 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {currentMonthExpenses.map(e => (
                      <tr key={e.id} className="group hover:bg-zinc-50">
                        <td className="py-4 text-sm">{format(parseISO(e.date), 'dd/MM')}</td>
                        <td className="py-4 font-bold">{e.description}</td>
                        <td className="py-4 text-[10px] font-bold text-zinc-400 uppercase">{e.category}</td>
                        <td className="py-4 text-right font-black text-primary">{formatCurrency(e.amount)}</td>
                        <td className="py-4 text-right">
                          <button onClick={() => handleDeleteExpense(e.id)} className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>

        <section className="space-y-6 pt-6">
          <div className="flex items-center gap-4 border-l-4 border-secondary pl-4">
            <div className="flex items-center gap-2">
               <Target size={28} className="text-secondary" />
               <h3 className="font-black text-2xl text-primary uppercase">Minhas Metas</h3>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsGoalFormOpen(true)} 
              className="text-xs border-secondary text-secondary hover:bg-secondary/10"
            >
              <Plus size={14}/> Nova Meta
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {goals.map(goal => (
              <Card key={goal.id} className={cn(
                "p-6 border-b-8 relative group transition-all duration-300",
                goal.status === 'Concluída' ? "border-emerald-500 shadow-lg shadow-emerald-100/20" : 
                goal.status === 'Em andamento' ? "border-yellow-400 shadow-lg shadow-yellow-100/20" : 
                "border-zinc-200"
              )}>
                <button onClick={() => handleDeleteGoal(goal.id)} className="absolute top-4 right-4 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1">
                  <Trash2 size={18} />
                </button>

                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1">
                      {goal.deadline ? format(parseISO(goal.deadline), 'MMMM yyyy', {locale: ptBR}) : 'Sem prazo'}
                    </span>
                    <h4 className="font-black text-primary text-xl">
                      {goal.title} {goal.status === 'Concluída' && '✨'}
                    </h4>
                  </div>
                  <Flag size={20} className={cn(
                    goal.status === 'Concluída' ? "text-emerald-500" : 
                    goal.status === 'Em andamento' ? "text-yellow-500" : "text-zinc-300"
                  )}/>
                </div>
                
                <div className="flex items-center gap-3 pt-4 border-t border-zinc-50 mt-4">
                  <div className="flex gap-2">
                    {[
                      { label: 'Não iniciada', color: 'bg-zinc-200' },
                      { label: 'Em andamento', color: 'bg-yellow-400' },
                      { label: 'Concluída', color: 'bg-emerald-500' }
                    ].map((s) => (
                      <button
                        key={s.label}
                        onClick={() => handleUpdateGoalStatus(goal.id, s.label)}
                        className={cn(
                          "w-5 h-5 rounded-full border-2 transition-all hover:scale-110",
                          goal.status === s.label ? "border-zinc-800 scale-110" : "border-transparent opacity-30 hover:opacity-100",
                          s.color
                        )}
                        title={s.label}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase">
                    {goal.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <AnimatePresence>
        {isFormOpen && (
          <Modal title="Lançar Gasto" onClose={() => setIsFormOpen(false)}>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <input type="text" placeholder="O que você comprou?" className="w-full p-4 bg-zinc-50 border-none rounded-2xl" required value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} />
              <input type="text" placeholder="Valor R$" className="w-full p-4 bg-zinc-50 border-none rounded-2xl" required value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} />
              
              <select className="w-full p-4 bg-zinc-50 border-none rounded-2xl" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value as Category})}>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <input type="date" className="w-full p-4 bg-zinc-50 border-none rounded-2xl" required value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} />
              <Button type="submit" className="w-full py-4 uppercase font-black">Salvar Gasto</Button>
            </form>
          </Modal>
        )}
        
        {isFixedFormOpen && (
          <Modal title="Nova Despesa Mensal" onClose={() => setIsFixedFormOpen(false)}>
            <form onSubmit={handleAddFixed} className="space-y-4">
              <select 
                className="w-full p-4 bg-zinc-50 border-none rounded-2xl" 
                required 
                value={newFixed.description} 
                onChange={e => setNewFixed({...newFixed, description: e.target.value, category: 'Moradia'})}
              >
                <option value="">Selecione a conta...</option>
                <option value="Aluguel">Aluguel</option>
                <option value="Energia">Energia</option>
                <option value="Água">Água</option>
                <option value="Internet">Internet</option>
                <option value="Mercado">Mercado</option>
                <option value="Academia">Academia</option>
                <option value="Streaming">Streaming</option>
                <option value="Outros">Outros</option>
              </select>
              
              <input 
                type="text" 
                placeholder="Valor Fixo R$" 
                className="w-full p-4 bg-zinc-50 border-none rounded-2xl" 
                required 
                value={newFixed.amount} 
                onChange={e => setNewFixed({...newFixed, amount: e.target.value})} 
              />

              <Button type="submit" variant="secondary" className="w-full py-4 uppercase font-black">
                Salvar Conta Fixa
              </Button>
            </form>
          </Modal>
        )}

        {isSalaryFormOpen && (
          <Modal title="Atualizar Salário" onClose={() => setIsSalaryFormOpen(false)}>
            <form onSubmit={handleUpdateSalary} className="space-y-4">
              <input type="text" placeholder="Valor do Salário R$" className="w-full p-4 bg-zinc-50 border-none rounded-2xl text-center text-2xl font-bold" required value={salaryInput} onChange={e => setSalaryInput(e.target.value)} />
              <Button type="submit" className="w-full py-4 uppercase font-black">Atualizar</Button>
            </form>
          </Modal>
        )}

        {isGoalFormOpen && (
          <Modal title="Novo Sonho" onClose={() => setIsGoalFormOpen(false)}>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <input type="text" placeholder="Título da Meta" className="w-full p-4 bg-zinc-50 border-none rounded-2xl" required value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} />
              <input type="text" placeholder="Valor Total R$" className="w-full p-4 bg-zinc-50 border-none rounded-2xl" required value={newGoal.target_amount} onChange={e => setNewGoal({...newGoal, target_amount: e.target.value})} />
              <input type="date" className="w-full p-4 bg-zinc-50 border-none rounded-2xl" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} />
              <Button type="submit" variant="secondary" className="w-full py-4 uppercase font-black">Criar Meta</Button>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Login() {
  const handleLogin = () => supabase.auth.signInWithOAuth({ provider: 'google' });
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-center px-8 lg:px-24 bg-white relative">
        <div className="absolute top-12 left-8 lg:left-24 flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Wallet className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-primary uppercase tracking-tighter leading-tight">GastoControl</h1>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Finanças Pessoais</p>
          </div>
        </div>
        <div className="max-w-md">
          <h2 className="text-5xl lg:text-6xl font-black text-primary mb-6 tracking-tight leading-[0.9]">Assuma o controle total da sua vida financeira.</h2>
          <p className="text-zinc-500 mb-10 text-lg">Organize seus gastos, planeje seu futuro e alcance seus objetivos com a simplicidade que você merece.</p>
          <button onClick={handleLogin} className="w-full bg-[#121926] hover:bg-black text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-black/10 active:scale-[0.98]">
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Entrar com Google
          </button>
          <p className="mt-8 text-xs text-zinc-400">Ao entrar, você concorda com nossos termos de serviço e política de privacidade.</p>
        </div>
      </div>
      <div className="hidden lg:flex bg-[#0f172a] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="relative z-10 w-full max-w-lg aspect-square bg-white/5 backdrop-blur-3xl rounded-[48px] border border-white/10 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-secondary/20">
            <Flag className="text-white" size={40} />
          </div>
          <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">Sua Jornada Financeira</h3>
          <p className="text-zinc-400 font-medium uppercase tracking-widest text-sm">Planejamento • Foco • Conquista</p>
          <div className="flex gap-2 mt-12">
            {[1, 2, 3].map(i => <div key={i} className="w-8 h-1 bg-white/10 rounded-full" />)}
            <div className="w-12 h-1 bg-secondary rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}