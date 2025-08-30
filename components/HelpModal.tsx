import React, { useState } from 'react';
import { XIcon } from '../constants';

const AccordionItem: React.FC<{ title: string; id: string; openSection: string | null; setOpenSection: (id: string | null) => void; children: React.ReactNode }> = ({ title, id, openSection, setOpenSection, children }) => {
    const isOpen = openSection === id;

    const toggleSection = () => {
        setOpenSection(isOpen ? null : id);
    };

    return (
        <div className="border-b border-border">
            <button
                onClick={toggleSection}
                className="w-full flex justify-between items-center text-left py-4 px-5"
                aria-expanded={isOpen}
                aria-controls={`content-${id}`}
            >
                <h3 className="font-semibold text-ink">{title}</h3>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-ink-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            <div
                id={`content-${id}`}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}
            >
                <div className="prose prose-sm max-w-none text-ink-muted px-5 pb-4">
                    {children}
                </div>
            </div>
        </div>
    );
};


const HelpModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [openSection, setOpenSection] = useState<string | null>('how-to');

    return (
        <div className="fixed inset-0 bg-surface z-50 flex flex-col animate-fade-in" aria-modal="true" role="dialog">
            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s ease-out; }
            `}</style>
            <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-border bg-bg/80 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-brand">Ayuda y Guía</h2>
                <button onClick={onClose} className="text-ink-muted hover:text-ink" aria-label="Cerrar ayuda">
                    <XIcon />
                </button>
            </div>
            <div className="flex-grow overflow-y-auto">
                <div className="container mx-auto max-w-3xl py-6">
                    <AccordionItem id="how-to" title="Cómo Empezar" openSection={openSection} setOpenSection={setOpenSection}>
                        <p>FitfaList está diseñado para ser intuitivo. Aquí tienes un resumen de las secciones principales:</p>
                        <ul>
                            <li><strong>Inicio:</strong> Tu panel de control. Te da un resumen rápido de tu lista de la compra actual y acceso a acciones rápidas como el 'Modo Compra' o 'Escanear Ticket'.</li>
                            <li><strong>Despensa:</strong> Aquí creas y gestionas tu despensa personal. Añade productos, sus precios en diferentes tiendas y cualquier detalle relevante. ¡Una despensa bien mantenida es la clave del ahorro!</li>
                            <li><strong>Lista:</strong> Tu lista de la compra activa. Aquí puedes ver todos los productos que necesitas comprar, organizados por categoría o por tienda para facilitar tu visita al supermercado.</li>
                            <li><strong>Tiendas:</strong> Gestiona las tiendas donde haces la compra. Puedes asignarles un color para identificarlas fácilmente.</li>
                        </ul>
                    </AccordionItem>
                    <AccordionItem id="benefits" title="Beneficios Clave" openSection={openSection} setOpenSection={setOpenSection}>
                        <p>Usar FitfaList te ayuda a:</p>
                        <ul>
                            <li><strong>Ahorrar Dinero:</strong> Al registrar los precios, la app te ayuda a elegir la tienda más barata para cada producto. ¡El escaneo de tickets automatiza este proceso!</li>
                            <li><strong>Ahorrar Tiempo:</strong> Olvídate de las listas de papel. Con la lista organizada por tienda y pasillos (próximamente), harás la compra más rápido que nunca.</li>
                            <li><strong>Comprar de Forma Inteligente:</strong> El 'Modo Compra' te ayuda a no olvidar nada y a marcar lo que ya tienes en el carrito. Los comandos de voz te permiten añadir productos mientras cocinas.</li>
                            <li><strong>Colaborar en Familia:</strong> (Próximamente con Firebase) Todos en casa podrán acceder y modificar la misma lista en tiempo real. ¡Se acabaron las llamadas desde el supermercado!</li>
                        </ul>
                    </AccordionItem>
                     <AccordionItem id="faq" title="Preguntas Frecuentes" openSection={openSection} setOpenSection={setOpenSection}>
                        <h4>¿Cómo funciona el escaneo de tickets?</h4>
                        <p>Simplemente ve a 'Inicio' o pulsa el icono de la cámara, selecciona la tienda, y haz una foto clara de tu ticket. Nuestra IA (inteligencia artificial) analizará el ticket, extraerá los productos y sus precios, y te permitirá actualizar tu despensa con un solo clic.</p>
                        
                        <h4>¿Cómo uso los comandos de voz?</h4>
                        <p>Pulsa el icono del micrófono en la cabecera. Cuando la app te escuche, di comandos como: "Añade leche y pan", "Crea un nuevo producto llamado 'Tomate Frito Hacendado' a 1.85 euros en Mercadona", o "Vacía la lista". ¡Es ideal para cuando tienes las manos ocupadas!</p>

                        <h4>¿Tengo que añadir los productos uno por uno?</h4>
                        <p>Al principio, sí. Crear tu despensa inicial es el primer paso. Pero una vez que uses la función de escanear tickets, muchos productos se añadirán y actualizarán automáticamente, ahorrándote mucho trabajo a largo plazo.</p>

                        <h4>¿Qué es un 'alias' de un producto?</h4>
                        <p>Un alias es otro nombre para el mismo producto. Por ejemplo, en el ticket, "LECHE SEMIDES" puede ser un alias para tu producto "Leche Semidesnatada". La app usa estos alias para reconocer automáticamente los productos de tus tickets.</p>
                    </AccordionItem>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;