import { motion } from 'framer-motion';
import { HiCog, HiLightningBolt } from 'react-icons/hi';
import { GiArtificialIntelligence } from 'react-icons/gi';

const LoadingSpinner = ({ message = "Generating flowchart..." }) => {
    const steps = [
        { icon: HiLightningBolt, text: 'Analyzing prompt', color: 'text-yellow-500' },
        { icon: GiArtificialIntelligence, text: 'AI processing', color: 'text-blue-500' },
        { icon: HiCog, text: 'Creating nodes', color: 'text-green-500' },
        { icon: HiCog, text: 'Building connections', color: 'text-purple-500' },
    ];

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="text-center max-w-md mx-auto px-6">
                <div className="relative mb-8">
                    <motion.div
                        className="w-32 h-32 mx-auto relative"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.div
                            className="absolute inset-0 border-4 border-blue-200 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div
                            className="absolute inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, -360]
                            }}
                            transition={{
                                scale: { duration: 2, repeat: Infinity },
                                rotate: { duration: 4, repeat: Infinity, ease: "linear" }
                            }}
                        >
                            <GiArtificialIntelligence className="text-white text-4xl" />
                        </motion.div>
                    </motion.div>
                </div>

                <motion.h3
                    className="text-2xl font-bold text-gray-800 mb-2"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    {message}
                </motion.h3>

                <motion.p
                    className="text-gray-600 mb-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    Please wait while AI creates your visualization
                </motion.p>

                <div className="space-y-3 max-w-xs mx-auto">
                    {steps.map((step, index) => {
                        const IconComponent = step.icon;
                        return (
                            <motion.div
                                key={index}
                                className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200"
                                initial={{ opacity: 0.3, x: -20 }}
                                animate={{
                                    opacity: [0.3, 1, 0.3],
                                    x: 0,
                                    scale: [1, 1.02, 1]
                                }}
                                transition={{
                                    opacity: { duration: 2, repeat: Infinity, delay: index * 0.4 },
                                    x: { duration: 0.3 },
                                    scale: { duration: 2, repeat: Infinity, delay: index * 0.4 }
                                }}
                            >
                                <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "linear",
                                        delay: index * 0.4
                                    }}
                                >
                                    <IconComponent className={`w-5 h-5 ${step.color}`} />
                                </motion.div>
                                <span className="text-sm text-gray-700 font-medium">{step.text}</span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

export default LoadingSpinner;
