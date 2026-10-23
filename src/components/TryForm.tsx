import { useState } from 'react';

export default function TryForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [formData, setFormData] = useState({
        type: 'individual',
        seed: 42,
        age: 35,
        region: 'MOSCOW',
        organizationType: 'SE'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);

        // Имитация задержки сети (500мс)
        setTimeout(() => {
            let mockResponse;

            if (formData.type === 'individual') {
                mockResponse = {
                    fullName: "Зайцев Григорий Григорьевич",
                    gender: "MALE",
                    birthDate: `${2026 - formData.age}-06-18`,
                    age: Number(formData.age),
                    familyStatus: Number(formData.age) < 18 ? "Холост/Не замужем" : "Женат/Замужем",
                    passport: {
                        series: formData.region === 'MOSCOW' ? "4515" : "4015",
                        number: "654321",
                        issuedBy: "Отделением УФМС России",
                        issueDate: Number(formData.age) >= 20 ? `${2026 - formData.age + 20}-06-18` : `${2026 - formData.age + 14}-06-18`,
                        type: "RF",
                        country: "RU"
                    },
                    inn: "427624447300",
                    snils: "11223344595",
                    bank: { bik: "044525225", name: "ПАО Сбербанк" },
                    account: "40817810500000012345"
                };
            } else if (formData.type === 'organization') {
                const isGup = formData.organizationType === 'SE';
                mockResponse = {
                    organizationName: isGup ? "ГУП «Мосгортранс»" : "ООО «Ромашка»",
                    organizationType: formData.organizationType,
                    ogrn: "1027700132195",
                    inn: "7707083893",
                    kpp: formData.region === 'MOSCOW' ? "770701001" : "780701001",
                    okopf: isGup ? "61" : "65",
                    okfs: isGup ? "14" : "16",
                    budget: isGup ? "Бюджетная организация" : "Небюджетная организация",
                    registrationAddress: { city: formData.region === 'MOSCOW' ? "Москва" : "Санкт-Петербург" }
                };
            } else {
                mockResponse = {
                    ogrnip: "304500116000157",
                    fullName: "Зайцев Григорий ИП Автотеста",
                    inn: "427624447300",
                    snils: "11223344595",
                    bank: { bik: "044525225", name: "ПАО Сбербанк" }
                };
            }

            setResult(mockResponse);
            setIsLoading(false);
        }, 500);
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Форма */}
            <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Параметры</h2>
                    <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded text-xs font-mono">
            DEMO MODE
          </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-mono text-[var(--text-muted)] uppercase mb-1">Тип профиля</label>
                        <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg p-3 text-sm font-mono text-white focus:outline-none focus:border-accent">
                            <option value="individual">Физлицо (Individual)</option>
                            <option value="ip">ИП (Individual Entrepreneur)</option>
                            <option value="organization">Юрлицо (Organization)</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-mono text-[var(--text-muted)] uppercase mb-1">Seed</label>
                            <input type="number" name="seed" value={formData.seed} onChange={handleChange} className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg p-3 text-sm font-mono text-white focus:outline-none focus:border-accent" />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-[var(--text-muted)] uppercase mb-1">Возраст</label>
                            <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg p-3 text-sm font-mono text-white focus:outline-none focus:border-accent" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-[var(--text-muted)] uppercase mb-1">Регион</label>
                        <select name="region" value={formData.region} onChange={handleChange} className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg p-3 text-sm font-mono text-white focus:outline-none focus:border-accent">
                            <option value="MOSCOW">Москва (77)</option>
                            <option value="SPB">Санкт-Петербург (78)</option>
                            <option value="SVERDLOVSK">Свердловская (66)</option>
                        </select>
                    </div>

                    {formData.type === 'organization' && (
                        <div>
                            <label className="block text-xs font-mono text-[var(--text-muted)] uppercase mb-1">ОПФ (Организационная форма)</label>
                            <select name="organizationType" value={formData.organizationType} onChange={handleChange} className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg p-3 text-sm font-mono text-white focus:outline-none focus:border-accent">
                                <option value="SE">ГУП (Бюджетная)</option>
                                <option value="LLC">ООО (Небюджетная)</option>
                                <option value="NCO">НКО (Некоммерческая)</option>
                            </select>
                        </div>
                    )}

                    <button type="submit" disabled={isLoading} className="w-full mt-4 bg-accent hover:bg-accent-light disabled:opacity-50 text-ink-950 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-ink-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Генерация...
                            </>
                        ) : (
                            'Сгенерировать профиль'
                        )}
                    </button>
                </form>
            </div>

            {/* Результат */}
            <div className="rounded-2xl border bg-[#0c0c0e] overflow-hidden flex flex-col" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center px-4 py-3 bg-white/5 border-b border-white/10">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                    </div>
                    <div className="mx-auto text-xs text-[#a1a1aa] font-mono">response.json</div>
                </div>

                <div className="p-5 font-mono text-[13px] leading-relaxed overflow-auto flex-1">
                    {isLoading ? (
                        <div className="text-accent animate-pulse flex items-center gap-2">
                            <span className="w-2 h-4 bg-accent inline-block animate-bounce"></span> POST /api/v1/generate/{formData.type}...
                        </div>
                    ) : result ? (
                        <pre className="text-[#fafafa]"><code>{JSON.stringify(result, null, 2)}</code></pre>
                    ) : (
                        <div className="text-[#8A96B5] flex flex-col items-center justify-center h-full gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            <span>Заполните форму и нажмите кнопку,</span>
                            <span>чтобы увидеть ответ API.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}