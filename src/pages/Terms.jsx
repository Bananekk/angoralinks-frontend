import { Link } from 'react-router-dom';
import { Link2, ArrowLeft, FileText } from 'lucide-react';

function Terms() {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-100">
            {/* Navbar */}
            <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2">
                            <Link2 className="w-8 h-8 text-primary-500" />
                            <span className="text-xl font-bold">AngoraLinks</span>
                        </Link>
                        <Link 
                            to="/" 
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Powrót
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-primary-600/20 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Regulamin</h1>
                        <p className="text-slate-400">Ostatnia aktualizacja: Styczeń 2025</p>
                    </div>
                </div>

                <div className="prose prose-invert prose-slate max-w-none">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
                        <p className="text-slate-300 leading-relaxed">
                            Korzystając z serwisu AngoraLinks, akceptujesz poniższe warunki. 
                            Prosimy o dokładne zapoznanie się z regulaminem przed rozpoczęciem korzystania z naszych usług.
                        </p>
                    </div>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-white">1. Definicje</h2>
                        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 space-y-2 text-slate-300">
                            <p><strong className="text-white">Serwis</strong> - platforma AngoraLinks dostępna pod adresem internetowym.</p>
                            <p><strong className="text-white">Użytkownik</strong> - osoba fizyczna korzystająca z Serwisu.</p>
                            <p><strong className="text-white">Link</strong> - skrócony adres URL wygenerowany przez Serwis.</p>
                            <p><strong className="text-white">Konto</strong> - indywidualne konto Użytkownika w Serwisie.</p>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-white">2. Zasady korzystania z Serwisu</h2>
                        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 text-slate-300">
                            <ul className="list-disc list-inside space-y-2">
                                <li>Użytkownik musi mieć ukończone 18 lat lub zgodę opiekuna prawnego.</li>
                                <li>Każdy Użytkownik może posiadać tylko jedno konto.</li>
                                <li>Użytkownik zobowiązuje się do podania prawdziwych danych podczas rejestracji.</li>
                                <li>Zabrania się udostępniania danych logowania osobom trzecim.</li>
                                <li>Użytkownik ponosi pełną odpowiedzialność za treści, do których prowadzą jego linki.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-white">3. Zakazane treści</h2>
                        <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-slate-300">
                            <p className="mb-3">Zabrania się tworzenia linków prowadzących do:</p>
                            <ul className="list-disc list-inside space-y-2">
                                <li>Treści nielegalnych, w tym naruszających prawa autorskie</li>            
                                <li>Treści promujących przemoc, nienawiść lub dyskryminację</li>
                                <li>Złośliwego oprogramowania, wirusów lub phishingu</li>
                                <li>Oszustw finansowych lub piramid finansowych</li>
                                <li>Nielegalnych substancji lub broni</li>
                                <li>Treści naruszających prywatność osób trzecich</li>
                            </ul>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-white">4. System zarobków</h2>
                        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 text-slate-300">
                            <ul className="list-disc list-inside space-y-2">
                                <li>Użytkownik otrzymuje 85% przychodów z reklam wyświetlanych na jego linkach.</li>
                                <li>Platforma pobiera 15% prowizji od każdego zarobku.</li>
                                <li>Minimalna kwota wypłaty wynosi $10.</li>
                                <li>Wypłaty realizowane są w ciągu 24-72 godzin roboczych.</li>
                                <li>Dostępne metody wypłat: PayPal, Bitcoin.</li>
                                <li>Zabrania się sztucznego generowania kliknięć (boty, klikanie własnych linków).</li>
                            </ul>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-white">5. Ochrona przed nadużyciami</h2>
                        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 text-slate-300">
                            <ul className="list-disc list-inside space-y-2">
                                <li>System automatycznie wykrywa podejrzane aktywności.</li>
                                <li>Kliknięcia z tego samego IP są zliczane tylko raz na 24 godziny.</li>
                                <li>W przypadku wykrycia nadużyć, konto może zostać zablokowane bez ostrzeżenia.</li>
                                <li>Środki uzyskane w sposób nieuczciwy nie podlegają wypłacie.</li>
                                <li>Zarząd strony nie odpowiada za treści publikowane przez użytkowników.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-white">6. Blokada i usunięcie konta</h2>
                        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 text-slate-300">
                            <p className="mb-3">Administracja zastrzega sobie prawo do:</p>
                            <ul className="list-disc list-inside space-y-2">
                                <li>Czasowego lub stałego zablokowania konta w przypadku naruszenia regulaminu.</li>
                                <li>Usunięcia linków naruszających zasady bez wcześniejszego powiadomienia.</li>
                                <li>Wstrzymania wypłaty środków do czasu wyjaśnienia podejrzanych aktywności.</li>
                                <li>Odmowy wypłaty środków uzyskanych w sposób nieuczciwy.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-white">7. Prywatność</h2>
                        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 text-slate-300">
                            <ul className="list-disc list-inside space-y-2">
                                <li>Zbieramy tylko niezbędne dane do świadczenia usług.</li>
                                <li>Dane osobowe nie są sprzedawane osobom trzecim.</li>
                                <li>Statystyki kliknięć są anonimizowane.</li>
                                <li>Użytkownik może w każdej chwili usunąć swoje konto i dane.</li>
                                <li>Korzystając z serwisu użytkownik zgadza się na udostępnienie swoich danych odpowiednim organom gdy będzie to konieczne.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-white">8. Zmiany regulaminu</h2>
                        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 text-slate-300">
                            <p>
                                Administracja zastrzega sobie prawo do zmiany regulaminu w dowolnym momencie. 
                                Użytkownicy zostaną powiadomieni o istotnych zmianach drogą mailową. 
                                Kontynuowanie korzystania z serwisu po wprowadzeniu zmian oznacza ich akceptację.
                            </p>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-white">9. Kontakt</h2>
                        <div className="bg-primary-900/20 border border-primary-800/50 rounded-lg p-4 text-slate-300">
                            <p>
                                W przypadku pytań dotyczących regulaminu lub działania serwisu, 
                                prosimy o kontakt poprzez{' '}
                                <Link to="/contact" className="text-primary-400 hover:text-primary-300 underline">
                                    formularz kontaktowy
                                </Link>.
                            </p>
                        </div>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-800 py-6 px-4">
                <div className="max-w-4xl mx-auto text-center text-slate-400 text-sm">
                    <p>© 2024 AngoraLinks. Wszystkie prawa zastrzeżone.</p>
                </div>
            </footer>
        </div>
    );
}

export default Terms;