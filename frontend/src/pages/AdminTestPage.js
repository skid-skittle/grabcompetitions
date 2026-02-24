import React from 'react';

export const AdminTestPage = () => {
    return (
        <div className="min-h-screen bg-[#0A0A0A] pt-24 flex items-center justify-center px-6">
            <div className="w-full max-w-md">
                <div className="bg-[#161616] border border-white/5 rounded-2xl p-8">
                    <h1 className="font-heading text-3xl font-bold text-white mb-6 text-center">
                        Admin Panel - Test Version
                    </h1>
                    <p className="text-white/50 text-center mb-6">
                        This is a simplified admin page to test routing.
                    </p>
                    <div className="bg-[#FF3B3B]/20 border border-[#FF3B3B]/30 rounded-lg p-4">
                        <p className="text-white text-center">
                            ✅ Admin route is working!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
