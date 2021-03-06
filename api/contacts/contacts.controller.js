//Core
const path = require('path');
const fsPromises = require('fs/promises');
//Utils
const { v4: uuidv4 } = require('uuid');
//Data path
const contactsPath = path.join(__dirname, '../../db/contacts.json');

//Read: return contacts list
async function listContacts(req, res, next) {
	try {
		const data = await fsPromises.readFile(contactsPath, 'utf-8');

		const parsedData = JSON.parse(data);

		return await res.status(200).send(parsedData);
	} catch (error) {
		console.error(error);
	}
}

//Read: return contact by id
async function getContactById(req, res, next) {
	const { contactId } = req.params;

	try {
		const data = await fsPromises.readFile(contactsPath, 'utf-8');

		const existContact = JSON.parse(data).find(({ id }) => id === contactId);

		existContact
			? await res.status(200).send(existContact)
			: await res.status(404).send({ message: 'Not found' });
	} catch (error) {
		console.error(error);
	}
}

//Create: receives contact data and return created contact with id
async function addContact(req, res, next) {
	try {
		const newContact = {
			id: uuidv4(),
			...req.body,
		};

		const data = await fsPromises.readFile(contactsPath, 'utf-8');

		const parsedData = JSON.parse(data).concat(newContact);
		const stringifyParsedData = JSON.stringify(parsedData, null, 2);

		await fsPromises.writeFile(contactsPath, stringifyParsedData, 'utf-8');

		return await res.status(201).send(newContact);
	} catch (error) {
		console.error(error);
	}
}

//Delete: remove contact by id
async function removeContact(req, res, next) {
	const { contactId } = req.params;

	try {
		const data = await fsPromises.readFile(contactsPath, 'utf-8');

		const parsedData = JSON.parse(data);
		const existContact = parsedData.find(({ id }) => id === contactId);

		if (!existContact) {
			return await res.status(404).send({ message: 'Not found' });
		}

		const updatedData = parsedData.filter(({ id }) => id !== contactId);
		const stringifyParsedData = JSON.stringify(updatedData, null, 2);

		await fsPromises.writeFile(contactsPath, stringifyParsedData, 'utf-8');

		return await res.status(200).send({ message: 'contact deleted' });
	} catch (error) {
		console.error(error);
	}
}

//Update: update contact information by id
async function updateContact(req, res, next) {
	try {
		const data = await fsPromises.readFile(contactsPath, 'utf-8');

		const { contactId } = req.params;
		const parsedData = JSON.parse(data);
		const existContactIdx = parsedData.findIndex(({ id }) => id === contactId);

		if (existContactIdx === -1) {
			return await res.status(404).send({ message: 'Not found' });
		}

		const updatedData = parsedData.map(contact =>
			contact.id === contactId ? { ...contact, ...req.body } : contact,
		);
		const stringifyParsedData = JSON.stringify(updatedData, null, 2);

		await fsPromises.writeFile(contactsPath, stringifyParsedData, 'utf-8');

		const updatedContact = updatedData[existContactIdx];

		return await res.status(200).send(updatedContact);
	} catch (error) {
		console.error(error);
	}
}

module.exports = { listContacts, addContact, removeContact, getContactById, updateContact };
