import { useState, type ChangeEvent } from 'react';

type OutputTab = 'json' | 'java' | 'curl' | 'cli';

export default function TryForm() {
    const [tab, setTab] = useState<OutputTab>('json');
    const [isGenerating, setIsGenerating] = useState(false);

    const [formData, setFormData] = useState({
        type: 'individual',
        seed: 42,
        gender: 'MALE',
        age: 35,
        region: 'MOSCOW',
        organizationType: 'SE',
        passportWasExchanged: true,
        categoryClient: 'КЛИЕНТ'
    });

    const [result, setResult] = useState<any>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            let mock: any;
            if (formData.type === 'individual') {
                const isMinor = formData.age < 18;
                const isSenior = formData.age >= 45;
                const isExchanged = formData.passportWasExchanged;
                const familyStatus = isMinor ? 'SINGLE' : 'MARRIED';
                const issueAge = isSenior ? 45 : (isExchanged && formData.age >= 20 ? 20 : 14);
                const regionCode = formData.region === 'MOSCOW' ? '77' : formData.region === 'SPB' ? '78' : '66';
                mock = {
                    fullName: formData.gender === 'MALE' ? "Зайцев Григорий Григорьевич" : "Зайцева Галина Григорьевна",
                    gender: formData.gender,
                    birthDate: `${2026 - formData.age}-06-18`,
                    age: formData.age,
                    familyStatus: familyStatus,
                    passport: {
                        series: `${regionCode}15`,
                        number: "654321",
                        issuedBy: "Отделением УФМС России",
                        issueDate: `${2026 - formData.age + issueAge}-06-18`,
                        departmentCode: `${regionCode}0-001`,
                        type: "RF",
                        country: "RU"
                    },
                    inn: "427624447300",
                    snils: "11223344595",
                    registrationAddress: {
                        postalCode: formData.region === 'MOSCOW' ? "125009" : "196247",
                        city: formData.region === 'MOSCOW' ? "Москва" : "Санкт-Петербург",
                        street: "Тверская",
                        formatted: `${formData.region === 'MOSCOW' ? "125009,Москва г" : "196247,Санкт-Петербург г"},,,,,,Тверская ул,1, ,`
                    },
                    bank: { bik: "044525225", name: "ПАО Сбербанк" },
                    account: "40817810500000012345",
                    categoryClient: formData.categoryClient,
                    accountPackage: formData.categoryClient === 'ЗАРПЛАТНИК' ? 'ЗАРПЛАТНЫЙ' : formData.categoryClient === 'ПЕНСИОНЕР' ? 'ПЕНСИОННЫЙ' : 'БАЗОВЫЙ'
                };
            } else if (formData.type === 'organization') {
                const isBudget = formData.organizationType === 'SE' || formData.organizationType === 'ME';
                const okopf = formData.organizationType === 'LLC' ? '65' : formData.organizationType === 'JSC' || formData.organizationType === 'PJSC' ? '47' : formData.organizationType === 'NCO' ? '85' : formData.organizationType === 'FOUNDATION' ? '88' : formData.organizationType === 'SE' ? '61' : '62';
                const okfs = isBudget ? (formData.organizationType === 'SE' ? '14' : '13') : '16';
                const prefix = formData.organizationType === 'LLC' ? 'ООО' : formData.organizationType === 'JSC' ? 'АО' : formData.organizationType === 'PJSC' ? 'ПАО' : formData.organizationType === 'NCO' ? 'НКО' : formData.organizationType === 'FOUNDATION' ? 'Фонд' : formData.organizationType === 'SE' ? 'ГУП' : 'МУП';
                mock = {
                    organizationName: `${prefix} «Ромашка»`,
                    organizationType: formData.organizationType,
                    ogrn: "1027700132195",
                    inn: "7707083893",
                    kpp: `${formData.region === 'MOSCOW' ? '77' : formData.region === 'SPB' ? '78' : '66'}0701001`,
                    okpo: "12345678",
                    okopf: okopf,
                    okfs: okfs,
                    budget: isBudget ? 'Бюджетная организация' : 'Небюджетная организация',
                    swift: "SABRRUMMXXX",
                    registrationAddress: { city: formData.region === 'MOSCOW' ? "Москва" : "Санкт-Петербург" },
                    email: "client12345@test.ru"
                };
            } else {
                mock = {
                    ogrnip: "304500116000157",
                    fullName: "Зайцев Григорий ИП Автотеста",
                    gender: formData.gender,
                    age: formData.age,
                    inn: "427624447300",
                    snils: "11223344595",
                    bank: { bik: "044525225", name: "ПАО Сбербанк" },
                    account: "40802810500000012345"
                };
            }
            setResult(mock);
            setIsGenerating(false);
        }, 400);
    };

    const getJson = () => JSON.stringify(result, null, 2);

    const getJavaCode = () => {
        if (formData.type === 'individual') {
            return `import ru.validum.core.profile.IndividualProfile;
import ru.validum.core.profile.IndividualProfileGenerator;
import ru.validum.core.common.Region;
import ru.validum.core.name.Gender;

IndividualProfile profile = IndividualProfileGenerator.builder()
    .seed(${formData.seed}L)
    .gender(Gender.${formData.gender})
    .age(${formData.age})
    .region(Region.${formData.region})
    .passportWasExchanged(${formData.passportWasExchanged})
    .categoryClient("${formData.categoryClient}")
    .build()
    .generate();

// profile.inn()  -> "${result?.inn || ''}"
// profile.snils() -> "${result?.snils || ''}"`;
        } else if (formData.type === 'organization') {
            return `import ru.validum.core.organization.OrganizationProfile;
import ru.validum.core.organization.OrganizationProfileGenerator;
import ru.validum.core.common.OrganizationType;
import ru.validum.core.common.Region;

OrganizationProfile org = OrganizationProfileGenerator.builder()
    .seed(${formData.seed}L)
    .organizationType(OrganizationType.${formData.organizationType})
    .region(Region.${formData.region})
    .build()
    .generate();

// org.ogrn()  -> "${result?.ogrn || ''}"
// org.inn()   -> "${result?.inn || ''}"
// org.kpp()   -> "${result?.kpp || ''}"`;
        }
        return `import ru.validum.core.organization.IpProfile;
import ru.validum.core.organization.IpProfileGenerator;
import ru.validum.core.profile.IndividualProfileGenerator;

IpProfile ip = IpProfileGenerator.generate(
    IndividualProfileGenerator.builder()
        .seed(${formData.seed}L)
        .age(${formData.age})
        .build(),
    ${formData.seed}L
);`;
    };

    const getCurl = () => {
        const endpoint = formData.type === 'individual' ? '/api/v1/generate/individual' : formData.type === 'organization' ? '/api/v1/generate/organization' : '/api/v1/generate/ip';
        const payload: any = { seed: formData.seed };
        if (formData.type !== 'organization') {
            payload.gender = formData.gender;
            payload.age = formData.age;
            payload.categoryClient = formData.categoryClient;
        }
        payload.region = formData.region;
        if (formData.type === 'individual') payload.passportWasExchanged = formData.passportWasExchanged;
        if (formData.type === 'organization') payload.organizationType = formData.organizationType;
        return `curl -X POST http://localhost:8080${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(payload)}'`;
    };

    const getCli = () => {
        if (formData.type === 'organization') {
            return `validum generate organization \\
  --seed ${formData.seed} \\
  --type ${formData.organizationType} \\
  --region ${formData.region} \\
  --format json`;
        } else if (formData.type === 'individual') {
            return `validum generate individual \\
  --seed ${formData.seed} \\
  --gender ${formData.gender} \\
  --age ${formData.age} \\
  --region ${formData.region} \\
  --format json`;
        }
        return `validum generate ip \\
  --seed ${formData.seed} \\
  --age ${formData.age} \\
  --format json`;
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).catch(() => {
            // Clipboard API недоступен (http://, нет разрешения).
            // Молча игнорируем — пользователь увидит, что текст не скопировался.
        });
    };

    const getHint = () => {
        switch (tab) {
            case 'json': return 'Ответ от POST /api/v1/generate/...';
            case 'java': return 'Вставьте в свой JUnit-тест';
            case 'curl': return 'Запустите в терминале (нужен запущенный API)';
            case 'cli': return 'Запустите локально (без API)';
        }
    };

    return (
        <div className="grid lg:grid-cols-12 gap-8">

            <div className="lg:col-span-5 space-y-6">
                <div className="p-6 rounded-2xl border border-line bg-surface-2">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-fg">Параметры</h2>
                        <span className="px-2 py-1 bg-accent/10 text-accent border border-accent/20 rounded text-[10px] font-mono">
                            MOCK-РЕЖИМ
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-mono text-fg-muted uppercase mb-2">Тип субъекта</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-surface-0 border border-line rounded-lg p-3 text-sm font-mono text-fg focus:border-accent outline-none">
                                <option value="individual">Физлицо (IndividualProfile)</option>
                                <option value="ip">ИП (IpProfile)</option>
                                <option value="organization">Юрлицо (OrganizationProfile)</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-mono text-fg-muted uppercase mb-2">Seed</label>
                                <input type="number" name="seed" value={formData.seed} onChange={handleChange} className="w-full bg-surface-0 border border-line rounded-lg p-3 text-sm font-mono text-fg focus:border-accent outline-none" />
                            </div>
                            {formData.type !== 'organization' ? (
                                <div>
                                    <label className="block text-xs font-mono text-fg-muted uppercase mb-2">Возраст</label>
                                    <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full bg-surface-0 border border-line rounded-lg p-3 text-sm font-mono text-fg focus:border-accent outline-none" />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-mono text-fg-muted uppercase mb-2">ОПФ</label>
                                    <select name="organizationType" value={formData.organizationType} onChange={handleChange} className="w-full bg-surface-0 border border-line rounded-lg p-3 text-sm font-mono text-fg focus:border-accent outline-none">
                                        <option value="LLC">ООО (LLC)</option>
                                        <option value="SE">ГУП (SE)</option>
                                        <option value="ME">МУП (ME)</option>
                                        <option value="JSC">АО (JSC)</option>
                                        <option value="PJSC">ПАО (PJSC)</option>
                                        <option value="NCO">НКО (NCO)</option>
                                        <option value="FOUNDATION">Фонд (FOUNDATION)</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {formData.type !== 'organization' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-mono text-fg-muted uppercase mb-2">Пол</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-surface-0 border border-line rounded-lg p-3 text-sm font-mono text-fg focus:border-accent outline-none">
                                        <option value="MALE">MALE</option>
                                        <option value="FEMALE">FEMALE</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-mono text-fg-muted uppercase mb-2">Категория</label>
                                    <select name="categoryClient" value={formData.categoryClient} onChange={handleChange} className="w-full bg-surface-0 border border-line rounded-lg p-3 text-sm font-mono text-fg focus:border-accent outline-none">
                                        <option value="КЛИЕНТ">КЛИЕНТ</option>
                                        <option value="ЗАРПЛАТНИК">ЗАРПЛАТНИК</option>
                                        <option value="ПЕНСИОНЕР">ПЕНСИОНЕР</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-mono text-fg-muted uppercase mb-2">Регион</label>
                            <select name="region" value={formData.region} onChange={handleChange} className="w-full bg-surface-0 border border-line rounded-lg p-3 text-sm font-mono text-fg focus:border-accent outline-none">
                                <option value="MOSCOW">Москва (77)</option>
                                <option value="SPB">Санкт-Петербург (78)</option>
                                <option value="SVERDLOVSK">Свердловская (66)</option>
                            </select>
                        </div>

                        {formData.type === 'individual' && (
                            <label className="flex items-center gap-3 p-3 rounded-lg border border-line bg-surface-0 cursor-pointer hover:opacity-80 transition">
                                <input type="checkbox" name="passportWasExchanged" checked={formData.passportWasExchanged} onChange={handleChange} className="accent-accent w-4 h-4" />
                                <span className="text-sm text-fg">Паспорт менялся (age ≥ 20)</span>
                            </label>
                        )}

                        <button onClick={handleGenerate} disabled={isGenerating} className="w-full mt-4 bg-accent hover:bg-accent-light disabled:opacity-50 text-accent-fg font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                            {isGenerating ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                    Генерация...
                                </>
                            ) : 'Сгенерировать'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-7">
                <div className="rounded-2xl border border-line bg-code overflow-hidden flex flex-col h-full shadow-lg">
                    <div className="flex border-b border-line bg-surface-1 px-2 pt-2">
                        {[
                            { id: 'json', label: 'JSON' },
                            { id: 'java', label: 'Java' },
                            { id: 'curl', label: 'cURL' },
                            { id: 'cli', label: 'CLI' },
                        ].map(t => (
                            <button key={t.id} onClick={() => setTab(t.id as OutputTab)} className={`px-4 py-2 text-xs font-mono rounded-t-md transition-colors ${tab === t.id ? 'bg-code text-accent border-t border-x border-line -mb-px' : 'text-fg-muted hover:text-fg'}`}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-5 font-mono text-[13px] leading-relaxed overflow-auto flex-1 relative min-h-[400px]">
                        {result && (
                            <div className="text-[10px] text-fg-muted mb-3 uppercase tracking-wider">
                                {getHint()}
                            </div>
                        )}

                        {!result ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-fg-subtle gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                <span className="text-sm">Нажмите "Сгенерировать"</span>
                            </div>
                        ) : (
                            <>
                                <button onClick={() => copyToClipboard(
                                    tab === 'json' ? getJson() :
                                        tab === 'java' ? getJavaCode() :
                                            tab === 'curl' ? getCurl() : getCli()
                                )} className="absolute top-3 right-3 px-2 py-1 bg-surface-2 hover:bg-surface-3 border border-line rounded text-[10px] text-fg-muted transition">
                                    COPY
                                </button>

                                <pre className="text-fg">
                                    {tab === 'json' && getJson()}
                                    {tab === 'java' && getJavaCode()}
                                    {tab === 'curl' && getCurl()}
                                    {tab === 'cli' && getCli()}
                                </pre>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}