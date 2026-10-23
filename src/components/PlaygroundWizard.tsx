import { useState } from 'react';

type Step = 'params' | 'generating' | 'register' | 'form' | 'result';

export default function PlaygroundWizard() {
    const [step, setStep] = useState<Step>('params');
    const [formData, setFormData] = useState({
        type: 'individual',
        age: 35,
        region: 'MOSCOW',
        orgType: 'SE'
    });

    const [generatedData, setGeneratedData] = useState<any>(null);

    const handleStart = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('generating');

        // Имитация запроса к Validum API
        setTimeout(() => {
            if (formData.type === 'individual') {
                setGeneratedData({
                    fullName: "Зайцев Григорий Григорьевич",
                    inn: "427624447300",
                    snils: "11223344595",
                    birthDate: `${2026 - formData.age}-06-18`,
                    passport: { series: "4515", number: "654321", issuedBy: "УФМС" },
                    bank: { bik: "044525225", name: "ПАО Сбербанк" },
                    account: "40817810500000012345",
                    address: "125009, Москва г, Тверская ул, д. 1"
                });
            } else {
                setGeneratedData({
                    organizationName: "ГУП «Мосгортранс»",
                    inn: "7707083893",
                    kpp: "770701001",
                    ogrn: "1027700132195",
                    okopf: "61",
                    budget: "Бюджетная",
                    address: "125009, Москва г, Тверская ул, д. 1"
                });
            }
            setStep('register');
        }, 1500);
    };

    return (
        <div className="rounded-2xl border bg-[var(--card-bg)] overflow-hidden shadow-2xl" style={{ borderColor: 'var(--border-color)' }}>

            {/* Индикатор шагов */}
            <div className="flex border-b border-white/5 bg-black/20 p-4">
                {['Параметры', 'Генерация', 'Регистрация', 'Анкета', 'Результат'].map((label, idx) => {
                    const stepNames: Step[] = ['params', 'generating', 'register', 'form', 'result'];
                    const isActive = stepNames.indexOf(step) === idx;
                    const isDone = stepNames.indexOf(step) > idx;

                    return (
                        <div key={label} className="flex-1 flex items-center gap-2 text-sm font-mono">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs ${isActive ? 'border-accent text-accent bg-accent/10' : isDone ? 'border-accent bg-accent text-ink-950' : 'border-white/20 text-white/30'}`}>
                                {isDone ? '✓' : idx + 1}
                            </div>
                            <span className={`${isActive ? 'text-white' : 'text-white/30'} hidden sm:block`}>{label}</span>
                        </div>
                    );
                })}
            </div>

            <div className="p-8 min-h-[400px] flex flex-col justify-center">

                {/* ШАГ 1: Параметры */}
                {step === 'params' && (
                    <form onSubmit={handleStart} className="max-w-md mx-auto w-full space-y-5 animate-fade-in">
                        <h2 className="text-2xl font-semibold mb-4 text-center">Настройка клиента</h2>

                        <div>
                            <label className="block text-xs font-mono text-[var(--text-muted)] uppercase mb-2">Тип субъекта</label>
                            <div className="flex gap-2">
                                {['individual', 'organization'].map(t => (
                                    <button type="button" key={t} onClick={() => setFormData({...formData, type: t})} className={`flex-1 py-2 rounded-lg border font-mono text-sm transition ${formData.type === t ? 'border-accent bg-accent/10 text-accent' : 'border-white/10 text-white/50 hover:border-white/30'}`}>
                                        {t === 'individual' ? 'Физлицо' : 'Юрлицо'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-[var(--text-muted)] uppercase mb-2">Возраст</label>
                            <input type="range" min="14" max="80" value={formData.age} onChange={(e) => setFormData({...formData, age: Number(e.target.value)})} className="w-full accent-accent" />
                            <div className="text-center font-mono text-accent mt-2">{formData.age} лет</div>
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-[var(--text-muted)] uppercase mb-2">Регион</label>
                            <select value={formData.region} onChange={(e) => setFormData({...formData, region: e.target.value})} className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg p-3 text-sm font-mono text-white focus:outline-none focus:border-accent">
                                <option value="MOSCOW">Москва (77)</option>
                                <option value="SPB">Санкт-Петербург (78)</option>
                            </select>
                        </div>

                        <button type="submit" className="w-full mt-6 bg-accent hover:bg-accent-light text-ink-950 font-semibold py-3 rounded-lg transition-colors">
                            Сгенерировать профиль
                        </button>
                    </form>
                )}

                {/* ШАГ 2: Загрузка */}
                {step === 'generating' && (
                    <div className="text-center animate-fade-in">
                        <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-6"></div>
                        <h2 className="text-xl font-mono text-accent animate-pulse">Validum обрабатывает данные...</h2>
                        <p className="text-sm text-[var(--text-muted)] mt-2">Проверка контрольных сумм и каскадов</p>
                    </div>
                )}

                {/* ШАГ 3: Регистрация */}
                {step === 'register' && (
                    <div className="max-w-md mx-auto w-full animate-fade-in">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 text-accent mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <h2 className="text-xl font-semibold">Профиль сгенерирован</h2>
                            <p className="text-sm text-[var(--text-muted)]">Все данные валидны и готовы к загрузке в АБС</p>
                        </div>

                        <div className="bg-[#0c0c0e] p-4 rounded-xl border border-white/10 mb-6 font-mono text-sm text-[#fafafa] overflow-x-auto">
                            {formData.type === 'individual' ? (
                                <>
                                    <div>ФИО: {generatedData.fullName}</div>
                                    <div>ИНН: <span className="text-accent">{generatedData.inn}</span></div>
                                    <div>СНИЛС: <span className="text-accent">{generatedData.snils}</span></div>
                                    <div>Счёт: {generatedData.account}</div>
                                </>
                            ) : (
                                <>
                                    <div>Орг: {generatedData.organizationName}</div>
                                    <div>ИНН: <span className="text-accent">{generatedData.inn}</span></div>
                                    <div>КПП: <span className="text-accent">{generatedData.kpp}</span></div>
                                </>
                            )}
                        </div>

                        <button onClick={() => setStep('form')} className="w-full bg-accent hover:bg-accent-light text-ink-950 font-semibold py-3 rounded-lg transition-colors">
                            Начать регистрацию
                        </button>
                    </div>
                )}

                {/* ШАГ 4: Анкета */}
                {step === 'form' && (
                    <div className="max-w-md mx-auto w-full animate-fade-in">
                        <h2 className="text-xl font-semibold mb-4 text-center">Заполнение анкеты</h2>
                        <p className="text-sm text-[var(--text-muted)] text-center mb-6">АБС автоматически подставила сгенерированные данные</p>

                        <div className="space-y-3">
                            <div className="p-3 rounded border border-accent/30 bg-accent/5 flex justify-between items-center">
                                <span className="text-xs text-[var(--text-muted)]">ИНН</span>
                                <span className="font-mono text-sm text-accent">{generatedData.inn}</span>
                            </div>
                            <div className="p-3 rounded border border-accent/30 bg-accent/5 flex justify-between items-center">
                                <span className="text-xs text-[var(--text-muted)]">Адрес</span>
                                <span className="font-mono text-sm text-accent">{generatedData.address}</span>
                            </div>
                        </div>

                        <button onClick={() => setStep('result')} className="w-full mt-6 bg-accent hover:bg-accent-light text-ink-950 font-semibold py-3 rounded-lg transition-colors">
                            Отправить в АБС
                        </button>
                    </div>
                )}

                {/* ШАГ 5: Результат */}
                {step === 'result' && (
                    <div className="text-center animate-fade-in max-w-md mx-auto">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 text-green-500 mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">Клиент успешно зарегистрирован</h2>
                        <p className="text-sm text-[var(--text-muted)] mb-8">АБС приняла все контрольные суммы. Ошибок не найдено.</p>

                        <button onClick={() => setStep('params')} className="text-sm font-mono text-accent hover:underline">
                            Запустить заново
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}