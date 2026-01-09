import ConfirmModal from '../../components/ConfirmModal';

const FaceEnroll = () => {
    // ... existing refs and state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // ... existing capture logic

    const handleDelete = async () => {
        // Modal will call this logic on confirm
        try {
            setStatus('processing');
            // Backend uses reset_face action (POST) instead of DELETE on enroll_face
            await api.post('/users/reset_face/');
            success('Face data deleted successfully.');
            setCapturedImage(null);
            setStatus('idle');
            await refreshUserProfile();
        } catch (error) {
            console.error(error);
            setStatus('error');
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to delete face data.';
            showError(errorMessage);
            // Reset to idle so user can try again or enroll
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 min-h-full">
            {/* ... existing header and content */}

            <div className="bg-surface/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                {/* ... existing scanner overlay and container content */}

                {/* Delete Face Data Button */}
                <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="absolute bottom-4 right-4 text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-colors flex items-center gap-2 text-sm font-medium"
                    title="Delete Face Data"
                >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete Face Data</span>
                </button>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Face Data"
                message="Are you sure you want to permanently delete your face data? This action cannot be undone and you will need to re-enroll to mark attendance."
                confirmText="Yes, Delete"
                isDestructive={true}
            />
        </div>
    );
};

export default FaceEnroll;
