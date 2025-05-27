const Section = require('../schema/Section');

async function handleCreateSection(req, res) { 
    const { sectionId, year, department, name} = req.body;

    const existing = await Section.findOne({ sectionId: sectionId });
    if (existing) return res.status(400).json({ msg: 'Section exists', isCreated: false });
    try {
        const section = await Section.create({ sectionId, year, department, name});
        res.json({ msg: 'Section created', section: section, isCreated: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error while creating section', isCreated: false });
    }
}

async function handleGetSection(req, res) {
    const { sectionId } = req.body;
    try {
        const section = await Section.findOne({ sectionId: sectionId });
        if (!section) return res.status(404).json({ msg: 'Section not found' });
        res.json({ msg: 'Section found', section: section });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error while fetching section' });
    }
}

async function handleGetAllSections(req, res) {
    try {
        const sections = await Section.find();
        res.json({ msg: 'Sections fetched', sections: sections });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error while fetching sections' });
    }
}



module.exports = {
    handleCreateSection,
    handleGetSection,
    handleGetAllSections
};
