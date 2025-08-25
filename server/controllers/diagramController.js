const Diagram = require('../models/Diagram');

module.exports = {
    // Save (Create) a diagram
    saveDiagram: async (req, res) => {
        try {
            const { title, diagramType, layout, nodes, edges, metadata } = req.body;
            const owner = req.user._id;

            const diagram = new Diagram({
                title,
                diagramType,
                layout,
                nodes,
                edges,
                metadata,
                owner,
            });

            await diagram.save();
            res.status(201).json(diagram);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get all diagrams for current user
    getUserDiagrams: async (req, res) => {
        try {
            const diagrams = await Diagram.find({ owner: req.user.id });
            res.json(diagrams);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get a single diagram by ID (if owner matches)
    getDiagramById: async (req, res) => {
        try {
            const { id } = req.params;
            const diagram = await Diagram.findOne({ _id: id, owner: req.user.id });

            if (!diagram) return res.status(404).json({ error: 'Diagram not found' });
            res.json(diagram);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Delete a diagram by ID (if owner matches)
    deleteDiagram: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await Diagram.deleteOne({ _id: id, owner: req.user.id });

            if (result.deletedCount === 0)
                return res.status(404).json({ error: 'Diagram not found or not authorized' });

            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get diagrams by userId
    getDiagramsByUserId: async (req, res) => {
        try {
            const { userId } = req.params;

            const diagrams = await Diagram.find({ owner: userId }).populate('owner', 'name email');

            if (!diagrams || diagrams.length === 0) {
                return res.status(404).json({ message: 'No diagrams found for this user' });
            }

            res.json(diagrams);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};
