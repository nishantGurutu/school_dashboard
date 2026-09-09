import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  Plus,
  Search,
  Download,
  MoreVertical,
  X,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  ChevronDown,
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  Ban,
  RotateCcw,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export const LibraryModule = () => {
  const { activeTab, setActiveTab } = useTheme();

  const getSubTabFromActiveTab = () => {
    if (activeTab === 'library-members') return 'members';
    if (activeTab === 'library-details') return 'details';
    if (activeTab === 'library-issue-return') return 'issuereturn';
    return 'books';
  };

  const [currentSubTab, setCurrentSubTab] = useState(getSubTabFromActiveTab());
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Selected Member for Member Details View Screen (Screenshot 5 from previous batch)
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    setCurrentSubTab(getSubTabFromActiveTab());
    setActiveDropdownId(null);
  }, [activeTab]);

  // 1. Books List Data (Screenshot 1 from previous batch)
  const [booksList, setBooksList] = useState([
    { id: 1, sl: '01', subject: 'Art', name: 'The Little Prince', publisher: 'Devon Lane', author: 'Darrell Steward', number: '101', rackNo: '1234', qty: '60', available: '20', price: '$250', date: '05 Jun 2015' },
    { id: 2, sl: '02', subject: 'Mathematics', name: 'Advanced Algebra', publisher: 'Penguin Books', author: 'Jane Cooper', number: '102', rackNo: '5678', qty: '40', available: '18', price: '$300', date: '10 Jul 2016' },
    { id: 3, sl: '03', subject: 'Science', name: 'Physics for Beginners', publisher: 'HarperCollins', author: 'Guy Hawkins', number: '103', rackNo: '8790', qty: '55', available: '30', price: '$280', date: '15 Mar 2017' },
    { id: 4, sl: '04', subject: 'History', name: 'World Wars', publisher: 'Oxford Press', author: 'Leslie Alexander', number: '104', rackNo: '3210', qty: '35', available: '12', price: '$200', date: '21 Sep 2018' },
    { id: 5, sl: '05', subject: 'Geography', name: 'Earth & Beyond', publisher: 'Macmillan', author: 'Robert Fox', number: '105', rackNo: '4311', qty: '45', available: '10', price: '$310', date: '08 Jan 2019' },
    { id: 6, sl: '06', subject: 'Biology', name: 'Human Anatomy', publisher: 'Cambridge House', author: 'Annette Black', number: '106', rackNo: '2915', qty: '70', available: '35', price: '$400', date: '11 Dec 2020' },
    { id: 7, sl: '07', subject: 'Economics', name: 'Money & Markets', publisher: 'Random House', author: 'Esther Howard', number: '107', rackNo: '3425', qty: '50', available: '28', price: '$270', date: '19 Mar 2021' },
    { id: 8, sl: '08', subject: 'Computer Science', name: 'JavaScript Essentials', publisher: 'TechWorld', author: 'Kathryn Murphy', number: '108', rackNo: '5320', qty: '80', available: '60', price: '$500', date: '05 Apr 2022' },
    { id: 9, sl: '09', subject: 'English', name: "Shakespeare's Works", publisher: 'Vintage Books', author: 'Courtney Henry', number: '109', rackNo: '1567', qty: '65', available: '45', price: '$350', date: '12 May 2023' }
  ]);

  // 2. Members List Data
  const [membersList, setMembersList] = useState([
    { id: 1, sl: '01', joinDate: '05 Jun 2015', cardNo: '12563', studentName: 'Jon Dev', className: 'Class 1 (A)', phone: '(+33)6 55 56 56 33', bookIssue: '2', issueDate: '01 Jun 2015', returnDate: '01 Feb 2015', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', email: 'jon.dev@example.com', section: 'A', gender: 'Male' },
    { id: 2, sl: '02', joinDate: '15 Jan 2016', cardNo: '12890', studentName: 'Emily Johnson', className: 'Class 2 (B)', phone: '(+1) 205 555 7821', bookIssue: '3', issueDate: '12 Jan 2016', returnDate: '20 Jan 2016', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', email: 'emily.j@example.com', section: 'B', gender: 'Female' },
    { id: 3, sl: '03', joinDate: '10 Feb 2017', cardNo: '14250', studentName: 'Michael Brown', className: 'Class 3 (C)', phone: '(+44) 745 987 3210', bookIssue: '1', issueDate: '05 Feb 2017', returnDate: '15 Feb 2017', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', email: 'michael.b@example.com', section: 'C', gender: 'Male' },
    { id: 4, sl: '04', joinDate: '22 Mar 2018', cardNo: '15642', studentName: 'Sarah Lee', className: 'Class 4 (A)', phone: '(+49) 178 556 9876', bookIssue: '4', issueDate: '15 Mar 2018', returnDate: '25 Mar 2018', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80', email: 'sarah.l@example.com', section: 'A', gender: 'Female' },
    { id: 5, sl: '05', joinDate: '09 Apr 2019', cardNo: '16580', studentName: 'William Smith', className: 'Class 5 (B)', phone: '(+91) 98765 43210', bookIssue: '2', issueDate: '05 Apr 2019', returnDate: '10 Apr 2019', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80', email: 'william.s@example.com', section: 'B', gender: 'Male' },
    { id: 6, sl: '06', joinDate: '20 May 2020', cardNo: '17690', studentName: 'Olivia White', className: 'Class 6 (C)', phone: '(+971) 55 432 7890', bookIssue: '3', issueDate: '18 May 2020', returnDate: '28 May 2020', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', email: 'olivia.w@example.com', section: 'C', gender: 'Female' }
  ]);

  // 3. Issue Return Data (Screenshot 2 from latest batch)
  const [issueReturnList, setIssueReturnList] = useState([
    { id: 1, sl: '01', cardNo: '12563', issueTo: 'Jon Dev', className: 'Class 1 (A)', bookName: 'The Little Prince', number: '101', issueDate: '01 Jun 2015', returnDate: '01 Feb 2015', status: 'Issued' },
    { id: 2, sl: '02', cardNo: '12874', issueTo: 'Sarah Khan', className: 'Class 2 (B)', bookName: 'To Kill a Mockingbird', number: '102', issueDate: '10 Jul 2016', returnDate: '25 Jul 2016', status: 'Issued' },
    { id: 3, sl: '03', cardNo: '13345', issueTo: 'Michael Lee', className: 'Class 3 (C)', bookName: '1984', number: '103', issueDate: '12 Mar 2017', returnDate: '02 Apr 2017', status: 'Issued' },
    { id: 4, sl: '04', cardNo: '14122', issueTo: 'Emma Watson', className: 'Class 4 (A)', bookName: 'Pride and Prejudice', number: '104', issueDate: '05 Aug 2018', returnDate: '28 Aug 2018', status: 'Issued' },
    { id: 5, sl: '05', cardNo: '14567', issueTo: 'David Miller', className: 'Class 5 (C)', bookName: 'The Great Gatsby', number: '105', issueDate: '11 Nov 2018', returnDate: '05 Dec 2018', status: 'Issued' },
    { id: 6, sl: '06', cardNo: '15231', issueTo: 'Olivia Brown', className: 'Class 6 (B)', bookName: 'The Hobbit', number: '106', issueDate: '22 May 2019', returnDate: '10 Jun 2019', status: 'Issued' },
    { id: 7, sl: '07', cardNo: '15890', issueTo: 'Lucas Smith', className: 'Class 7 (A)', bookName: 'Jane Eyre', number: '107', issueDate: '03 Apr 2020', returnDate: '20 Apr 2020', status: 'Issued' },
    { id: 8, sl: '08', cardNo: '16324', issueTo: 'Ella Johnson', className: 'Class 8 (B)', bookName: 'The Alchemist', number: '108', issueDate: '09 Oct 2021', returnDate: '28 Oct 2021', status: 'Issued' },
    { id: 9, sl: '09', cardNo: '17215', issueTo: 'Noah Wilson', className: 'Class 9 (C)', bookName: 'Brave New World', number: '109', issueDate: '05 Jan 2022', returnDate: '28 Jan 2022', status: 'Issued' }
  ]);

  // Books Modal State (Add / Edit Book)
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookFormData, setBookFormData] = useState({
    name: '', publisher: '', author: '', number: '', subject: '', rackNo: '', qty: '', available: '', price: '', date: '15/05/2025', status: 'Select Status'
  });

  // Member Modal State (Add Member / Issue Book - Screenshots 1 & 3)
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isIssueOnlyModal, setIsIssueOnlyModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberFormData, setMemberFormData] = useState({
    cardNo: '', className: '', section: '', studentName: 'Select Student', email: '', phone: '', joinDate: '15/05/2025', subject: 'Select a Subject', bookName: 'Select a book', issueDate: '15/05/2025', returnDate: '25/05/2025'
  });

  // Return Book Confirmation Modal State (Screenshot 4 from latest batch)
  const [isReturnConfirmModalOpen, setIsReturnConfirmModalOpen] = useState(false);
  const [selectedReturnItem, setSelectedReturnItem] = useState(null);

  const handleSubTabChange = (tabKey) => {
    setCurrentSubTab(tabKey);
    setActiveDropdownId(null);
    if (tabKey === 'books') setActiveTab('library-books');
    if (tabKey === 'members') setActiveTab('library-members');
    if (tabKey === 'details') setActiveTab('library-details');
    if (tabKey === 'issuereturn') setActiveTab('library-issue-return');
  };

  // Add / Edit Book Handlers
  const handleOpenAddBookModal = () => {
    setEditingBook(null);
    setBookFormData({ name: '', publisher: '', author: '', number: '', subject: '', rackNo: '', qty: '', available: '', price: '', date: '15/05/2025', status: 'Select Status' });
    setIsBookModalOpen(true);
  };

  const handleOpenEditBookModal = (book) => {
    setEditingBook(book);
    setActiveDropdownId(null);
    setBookFormData({
      name: book.name, publisher: book.publisher, author: book.author, number: book.number, subject: book.subject, rackNo: book.rackNo, qty: book.qty, available: book.available, price: book.price ? book.price.replace('$', '') : '250', date: book.date || '15/05/2025', status: 'Active'
    });
    setIsBookModalOpen(true);
  };

  const handleDeleteBook = (id) => {
    setActiveDropdownId(null);
    setBooksList((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSaveBookForm = (e) => {
    e.preventDefault();
    if (editingBook) {
      setBooksList((prev) =>
        prev.map((b) =>
          b.id === editingBook.id
            ? {
                ...b,
                name: bookFormData.name || b.name,
                publisher: bookFormData.publisher || b.publisher,
                author: bookFormData.author || b.author,
                number: bookFormData.number || b.number,
                subject: bookFormData.subject || b.subject,
                rackNo: bookFormData.rackNo || b.rackNo,
                qty: bookFormData.qty || b.qty,
                available: bookFormData.available || b.available,
                price: bookFormData.price ? `$${bookFormData.price}` : b.price,
                date: bookFormData.date || b.date
              }
            : b
        )
      );
    } else {
      const newBook = {
        id: Date.now(),
        sl: `${booksList.length + 1 < 10 ? '0' : ''}${booksList.length + 1}`,
        subject: bookFormData.subject || 'General',
        name: bookFormData.name || 'New Library Book',
        publisher: bookFormData.publisher || 'Tech Publisher',
        author: bookFormData.author || 'Author Name',
        number: bookFormData.number || '110',
        rackNo: bookFormData.rackNo || '1234',
        qty: bookFormData.qty || '50',
        available: bookFormData.available || '30',
        price: `$${bookFormData.price || '250'}`,
        date: bookFormData.date || '05 Jun 2025'
      };
      setBooksList([newBook, ...booksList]);
    }
    setIsBookModalOpen(false);
  };

  // Member & Issue Return Handlers
  const handleOpenAddMemberModal = () => {
    setEditingMember(null);
    setIsIssueOnlyModal(false);
    setMemberFormData({
      cardNo: '', className: '', section: '', studentName: 'Select Student', email: '', phone: '', joinDate: '15/05/2025', subject: 'Select a Subject', bookName: 'Select a book', issueDate: '15/05/2025', returnDate: '25/05/2025'
    });
    setIsMemberModalOpen(true);
  };

  const handleOpenAddIssueReturnModal = () => {
    setEditingMember(null);
    setIsIssueOnlyModal(false);
    setMemberFormData({
      cardNo: '', className: '', section: '', studentName: 'Select Student', email: '', phone: '', joinDate: '15/05/2025', subject: 'Select a Subject', bookName: 'Select a book', issueDate: '15/05/2025', returnDate: '25/05/2025'
    });
    setIsMemberModalOpen(true);
  };

  const handleOpenEditMemberModal = (member) => {
    setEditingMember(member);
    setIsIssueOnlyModal(false);
    setActiveDropdownId(null);
    setMemberFormData({
      cardNo: member.cardNo, className: member.className, section: member.section || 'A', studentName: member.studentName || member.issueTo, email: member.email || 'student@example.com', phone: member.phone || '(+1) 205 555 7821', joinDate: member.joinDate || '15/05/2025', subject: 'Computer Science', bookName: member.bookName || 'JavaScript Essentials', issueDate: member.issueDate || '15/05/2025', returnDate: member.returnDate || '25/05/2025'
    });
    setIsMemberModalOpen(true);
  };

  const handleOpenIssueBookModal = (member) => {
    setEditingMember(member);
    setIsIssueOnlyModal(true);
    setActiveDropdownId(null);
    setMemberFormData({
      cardNo: member ? member.cardNo : '', className: member ? member.className : '', section: member ? (member.section || 'A') : '', studentName: member ? (member.studentName || member.issueTo) : 'Select Student', email: member ? (member.email || 'student@example.com') : '', phone: member ? (member.phone || '(+1) 205 555 7821') : '', joinDate: member ? (member.joinDate || '15/05/2025') : '', subject: 'Select a Subject', bookName: 'Select a book', issueDate: '15/05/2025', returnDate: '25/05/2025'
    });
    setIsMemberModalOpen(true);
  };

  // View Member Details Screen
  const handleViewMemberDetails = (member) => {
    setSelectedMember(member);
    setActiveDropdownId(null);
    setCurrentSubTab('details');
    setActiveTab('library-details');
  };

  const handleDeleteMember = (id) => {
    setActiveDropdownId(null);
    setMembersList((prev) => prev.filter((m) => m.id !== id));
  };

  const handleDeleteIssueReturn = (id) => {
    setActiveDropdownId(null);
    setIssueReturnList((prev) => prev.filter((i) => i.id !== id));
  };

  // Return Book Confirmation Modal Open
  const handleOpenReturnConfirmModal = (item) => {
    setSelectedReturnItem(item);
    setActiveDropdownId(null);
    setIsReturnConfirmModalOpen(true);
  };

  // Confirm Return Book
  const handleConfirmReturnBook = () => {
    if (selectedReturnItem) {
      setIssueReturnList((prev) => prev.filter((i) => i.id !== selectedReturnItem.id));
    }
    setIsReturnConfirmModalOpen(false);
    setSelectedReturnItem(null);
  };

  const handleSaveMemberForm = (e) => {
    e.preventDefault();
    if (currentSubTab === 'issuereturn' || memberFormData.bookName !== 'Select a book') {
      const newIssue = {
        id: Date.now(),
        sl: `${issueReturnList.length + 1 < 10 ? '0' : ''}${issueReturnList.length + 1}`,
        cardNo: memberFormData.cardNo || '12563',
        issueTo: memberFormData.studentName !== 'Select Student' ? memberFormData.studentName : 'Jon Dev',
        className: memberFormData.className || 'Class 1 (A)',
        bookName: memberFormData.bookName !== 'Select a book' ? memberFormData.bookName : 'The Little Prince',
        number: '101',
        issueDate: memberFormData.issueDate || '01 Jun 2025',
        returnDate: memberFormData.returnDate || '15 Jun 2025',
        status: 'Issued'
      };
      setIssueReturnList([newIssue, ...issueReturnList]);
    } else if (editingMember) {
      setMembersList((prev) =>
        prev.map((m) =>
          m.id === editingMember.id
            ? {
                ...m,
                cardNo: memberFormData.cardNo || m.cardNo,
                className: memberFormData.className || m.className,
                studentName: memberFormData.studentName !== 'Select Student' ? memberFormData.studentName : m.studentName,
                email: memberFormData.email || m.email,
                phone: memberFormData.phone || m.phone,
                joinDate: memberFormData.joinDate || m.joinDate,
                issueDate: memberFormData.issueDate || m.issueDate,
                returnDate: memberFormData.returnDate || m.returnDate
              }
            : m
        )
      );
    } else {
      const newMember = {
        id: Date.now(),
        sl: `${membersList.length + 1 < 10 ? '0' : ''}${membersList.length + 1}`,
        joinDate: memberFormData.joinDate || '05 Jun 2025',
        cardNo: memberFormData.cardNo || '12990',
        studentName: memberFormData.studentName !== 'Select Student' ? memberFormData.studentName : 'New Student',
        className: memberFormData.className || 'Class 1 (A)',
        phone: memberFormData.phone || '(+1) 205 555 9999',
        bookIssue: '1',
        issueDate: memberFormData.issueDate || '01 Jun 2025',
        returnDate: memberFormData.returnDate || '15 Jun 2025',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
        email: memberFormData.email || 'student@example.com',
        section: 'A',
        gender: 'Male'
      };
      setMembersList([newMember, ...membersList]);
    }
    setIsMemberModalOpen(false);
  };

  const toggleSelectAll = (list) => {
    if (selectedRows.length === list.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(list.map((item) => item.id));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    );
  };

  const getHeaderInfo = () => {
    if (currentSubTab === 'details') {
      return {
        title: 'Member Details',
        breadcrumb: 'Dashboard / Library / Member Details'
      };
    }
    if (currentSubTab === 'members') {
      return {
        title: 'Members List',
        breadcrumb: 'Dashboard / Members List',
        addBtnLabel: '+ Add Members'
      };
    }
    if (currentSubTab === 'issuereturn') {
      return {
        title: 'Issue Return',
        breadcrumb: 'Dashboard / Issue Return',
        addBtnLabel: '+ Add Issue Return'
      };
    }
    return {
      title: 'Books List',
      breadcrumb: 'Dashboard / Books List',
      addBtnLabel: '+ Add Book'
    };
  };

  const headerInfo = getHeaderInfo();

  // -------------------------------------------------------------
  // MAIN BOOKS LIST, MEMBERS LIST, ISSUE RETURN & MEMBER DETAILS VIEWS
  // -------------------------------------------------------------
  const member = selectedMember || membersList[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      {currentSubTab === 'details' ? (
        /* Member Details View Screen */
        <>
          {/* Top Header Card */}
          <div
            className="card animate-fade-in"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Member Details</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Dashboard / Library / Member Details</p>
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => handleSubTabChange('members')}
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
            >
              <ArrowLeft size={16} /> Back to Members
            </button>
          </div>

          {/* Member Profile Banner Card */}
          <div className="card animate-fade-in" style={{ padding: '32px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px', alignItems: 'center' }}>
            {/* Left Avatar Column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderRight: '1px solid var(--border-light)', paddingRight: '24px' }}>
              <img
                src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={member.studentName}
                style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #ccfbf1', marginBottom: '12px' }}
              />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>{member.studentName || 'Seth Hallam'}</h3>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d9488', marginBottom: '16px' }}>
                Admission No: {member.cardNo ? `AD12${member.cardNo}` : 'AD1256589'}
              </p>

              <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'center' }}>
                <button className="btn btn-secondary" style={{ flex: 1, padding: '8px 14px', color: '#ef4444', borderColor: '#ef4444', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Ban size={14} /> Suspend
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleOpenEditMemberModal(member)}
                  style={{ flex: 1, padding: '8px 14px', backgroundColor: '#0d9488', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Edit size={14} /> Edit
                </button>
              </div>
            </div>

            {/* Right Personal Info Grid */}
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>Personal Info</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px 16px', fontSize: '0.875rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Class</div>
                <div>: {member.className || 'Class 6 (2025-26)'}</div>

                <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Section</div>
                <div>: {member.section || 'A'}</div>

                <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Join Date</div>
                <div>: {member.joinDate || '10'}</div>

                <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Gender</div>
                <div>: {member.gender || '10 Nov 2008'}</div>

                <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Phone Number</div>
                <div style={{ color: '#0d9488', fontWeight: 600 }}>: {member.phone || '789678456'}</div>

                <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Email</div>
                <div style={{ color: '#0d9488', fontWeight: 600 }}>: {member.email || 'Set@example.com'}</div>
              </div>
            </div>
          </div>

          {/* Book Issued Section */}
          <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Book Issued</h3>
              <button
                className="btn btn-primary"
                onClick={() => handleOpenIssueBookModal(member)}
                style={{ padding: '8px 16px', backgroundColor: '#0d9488', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} /> Add Issue Book
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search..."
                  style={{
                    width: '100%',
                    padding: '8px 14px 8px 36px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-app)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>Rows per page:</span>
                <select style={{ padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}>
                  <option value={10}>10</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px 16px', width: '40px' }}><input type="checkbox" /></th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>S.L ▲</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Book Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Number</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Issue Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Return Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 16px' }}><input type="checkbox" /></td>
                    <td style={{ padding: '14px 16px' }}>01</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>The Little Prince</td>
                    <td style={{ padding: '14px 16px' }}>101</td>
                    <td style={{ padding: '14px 16px' }}>01 Jun 2015</td>
                    <td style={{ padding: '14px 16px' }}>01 Feb 2015</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <IssueReturnActionDropdownCell
                        isOpen={activeDropdownId === 'det-1'}
                        onToggle={() => setActiveDropdownId(activeDropdownId === 'det-1' ? null : 'det-1')}
                        onReturnBook={() => handleOpenReturnConfirmModal({ bookName: 'The Little Prince', issueTo: member.studentName || 'Seth Hallam', id: 'det-1' })}
                        onEdit={() => handleOpenIssueBookModal(member)}
                        onDelete={() => {}}
                      />
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 16px' }}><input type="checkbox" /></td>
                    <td style={{ padding: '14px 16px' }}>02</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>To Kill a Mockingbird</td>
                    <td style={{ padding: '14px 16px' }}>102</td>
                    <td style={{ padding: '14px 16px' }}>10 Jul 2016</td>
                    <td style={{ padding: '14px 16px' }}>25 Jul 2016</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <IssueReturnActionDropdownCell
                        isOpen={activeDropdownId === 'det-2'}
                        onToggle={() => setActiveDropdownId(activeDropdownId === 'det-2' ? null : 'det-2')}
                        onReturnBook={() => handleOpenReturnConfirmModal({ bookName: 'To Kill a Mockingbird', issueTo: member.studentName || 'Seth Hallam', id: 'det-2' })}
                        onEdit={() => handleOpenIssueBookModal(member)}
                        onDelete={() => {}}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Top Header Card */}
          <div
            className="card animate-fade-in"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{headerInfo.title}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{headerInfo.breadcrumb}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Sub-Nav Tabs */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-app)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <button
              onClick={() => handleSubTabChange('books')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: currentSubTab === 'books' ? '#0d9488' : 'transparent',
                color: currentSubTab === 'books' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: currentSubTab === 'books' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Books List
            </button>

            <button
              onClick={() => handleSubTabChange('members')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: currentSubTab === 'members' ? '#0d9488' : 'transparent',
                color: currentSubTab === 'members' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: currentSubTab === 'members' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Members List
            </button>

            <button
              onClick={() => handleSubTabChange('issuereturn')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: currentSubTab === 'issuereturn' ? '#0d9488' : 'transparent',
                color: currentSubTab === 'issuereturn' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: currentSubTab === 'issuereturn' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Issue Return
            </button>
          </div>

          <button
            className="btn btn-primary"
            onClick={
              currentSubTab === 'books'
                ? handleOpenAddBookModal
                : currentSubTab === 'issuereturn'
                ? handleOpenAddIssueReturnModal
                : handleOpenAddMemberModal
            }
            style={{
              padding: '10px 20px',
              backgroundColor: '#0d9488',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={18} /> {headerInfo.addBtnLabel}
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
        {/* Controls Toolbar Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={14} /> Export <ChevronDown size={14} />
            </button>

            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 14px 8px 36px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Data Table View */}
        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 16px', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={
                      currentSubTab === 'books'
                        ? selectedRows.length === booksList.length
                        : currentSubTab === 'members'
                        ? selectedRows.length === membersList.length
                        : selectedRows.length === issueReturnList.length
                    }
                    onChange={() =>
                      toggleSelectAll(currentSubTab === 'books' ? booksList : currentSubTab === 'members' ? membersList : issueReturnList)
                    }
                    style={{ cursor: 'pointer' }}
                  />
                </th>

                <th style={{ padding: '12px 16px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    S.L <span>▲</span>
                  </div>
                </th>

                {currentSubTab === 'books' && (
                  <>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Subject</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Book Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Publisher</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Author</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Number</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Rack No</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Qty</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Available</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Price</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Post Date</th>
                  </>
                )}

                {currentSubTab === 'members' && (
                  <>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Join Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Card No</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Student Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Class</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Phone Number</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Book Issue</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Issue Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Return Date</th>
                  </>
                )}

                {currentSubTab === 'issuereturn' && (
                  <>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Card No</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Issue To</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Class</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Book Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Number</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Issue Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Return Date</th>
                  </>
                )}

                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* 1. Books List Table */}
              {currentSubTab === 'books' &&
                booksList
                  .filter((b) => b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.subject.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row.id)}
                          onChange={() => toggleSelectRow(row.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 500, color: 'var(--text-secondary)' }}>{row.sl}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.subject}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{row.name}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.publisher}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.author}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 500 }}>{row.number}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.rackNo}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>{row.qty}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#10b981' }}>{row.available}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{row.price}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.date}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', position: 'relative' }}>
                        <BookActionDropdownCell
                          isOpen={activeDropdownId === row.id}
                          onToggle={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                          onEdit={() => handleOpenEditBookModal(row)}
                          onDelete={() => handleDeleteBook(row.id)}
                        />
                      </td>
                    </tr>
                  ))}

              {/* 2. Members List Table */}
              {currentSubTab === 'members' &&
                membersList
                  .filter((m) => m.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || m.cardNo.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row.id)}
                          onChange={() => toggleSelectRow(row.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 500, color: 'var(--text-secondary)' }}>{row.sl}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.joinDate}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>{row.cardNo}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{row.studentName}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.className}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.phone}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, textAlign: 'center' }}>{row.bookIssue}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.issueDate}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.returnDate}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', position: 'relative' }}>
                        <MemberActionDropdownCell
                          isOpen={activeDropdownId === row.id}
                          onToggle={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                          onView={() => handleViewMemberDetails(row)}
                          onEdit={() => handleOpenEditMemberModal(row)}
                          onIssueBook={() => handleOpenIssueBookModal(row)}
                          onDelete={() => handleDeleteMember(row.id)}
                        />
                      </td>
                    </tr>
                  ))}

              {/* 3. Issue Return Table (Screenshot 2 from latest batch) */}
              {currentSubTab === 'issuereturn' &&
                issueReturnList
                  .filter((i) => i.issueTo.toLowerCase().includes(searchTerm.toLowerCase()) || i.bookName.toLowerCase().includes(searchTerm.toLowerCase()) || i.cardNo.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row.id)}
                          onChange={() => toggleSelectRow(row.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 500, color: 'var(--text-secondary)' }}>{row.sl}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>{row.cardNo}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{row.issueTo}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.className}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>{row.bookName}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.number}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.issueDate}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.returnDate}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', position: 'relative' }}>
                        <IssueReturnActionDropdownCell
                          isOpen={activeDropdownId === row.id}
                          onToggle={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                          onReturnBook={() => handleOpenReturnConfirmModal(row)}
                          onEdit={() => handleOpenEditMemberModal(row)}
                          onDelete={() => handleDeleteIssueReturn(row.id)}
                        />
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {/* Add / Edit Book Right Slide-over Drawer Modal */}
      {isBookModalOpen && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(3px)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end', animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setIsBookModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: '560px', maxWidth: '90vw', height: '100vh', backgroundColor: 'var(--bg-card)', boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 1001, animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{editingBook ? 'Edit Book' : 'Add Book'}</h3>
              <button onClick={() => setIsBookModalOpen(false)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBookForm} id="add-book-form" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', flex: 1, overflowY: 'auto' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Book Name</label>
                <input type="text" placeholder="Enter Book Name" value={bookFormData.name} onChange={(e) => setBookFormData({ ...bookFormData, name: e.target.value })} style={inputStyle} required />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Publisher</label>
                  <input type="text" placeholder="Enter Publisher" value={bookFormData.publisher} onChange={(e) => setBookFormData({ ...bookFormData, publisher: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Author</label>
                  <input type="text" placeholder="Enter Author" value={bookFormData.author} onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Number</label>
                  <input type="text" placeholder="Enter Number" value={bookFormData.number} onChange={(e) => setBookFormData({ ...bookFormData, number: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Subject</label>
                  <input type="text" placeholder="Enter Subject" value={bookFormData.subject} onChange={(e) => setBookFormData({ ...bookFormData, subject: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Rack No</label>
                  <input type="text" placeholder="Enter Rack No" value={bookFormData.rackNo} onChange={(e) => setBookFormData({ ...bookFormData, rackNo: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Qty</label>
                  <input type="text" placeholder="Enter Qty" value={bookFormData.qty} onChange={(e) => setBookFormData({ ...bookFormData, qty: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Available</label>
                  <input type="text" placeholder="Enter Available" value={bookFormData.available} onChange={(e) => setBookFormData({ ...bookFormData, available: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Price</label>
                  <input type="text" placeholder="Enter Price" value={bookFormData.price} onChange={(e) => setBookFormData({ ...bookFormData, price: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Post Date</label>
                  <input type="text" placeholder="dd/mm/yyyy" value={bookFormData.date} onChange={(e) => setBookFormData({ ...bookFormData, date: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Status</label>
                  <select value={bookFormData.status} onChange={(e) => setBookFormData({ ...bookFormData, status: e.target.value })} style={inputStyle}>
                    <option value="Select Status">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </form>

            <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <button type="button" onClick={() => setIsBookModalOpen(false)} className="btn btn-secondary" style={{ padding: '10px 32px', color: '#ef4444', borderColor: '#ef4444', fontWeight: 700, fontSize: '0.9rem' }}>Cancel</button>
              <button type="submit" form="add-book-form" className="btn btn-primary" style={{ padding: '10px 36px', backgroundColor: '#0d9488', color: '#ffffff', fontWeight: 700, fontSize: '0.9rem' }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member / Add Book Issue Right Slide-over Drawer Modal (Screenshots 1 & 3 from latest batch) */}
      {isMemberModalOpen && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(3px)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end', animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setIsMemberModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: '560px', maxWidth: '90vw', height: '100vh', backgroundColor: 'var(--bg-card)', boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 1001, animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {isIssueOnlyModal ? 'Add Book Issue' : editingMember ? 'Add Book Issue' : 'Add Book Issue / Add Member'}
              </h3>
              <button onClick={() => setIsMemberModalOpen(false)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveMemberForm} id="member-form" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', flex: 1, overflowY: 'auto' }}>
              {!isIssueOnlyModal && (
                <>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Library Card No</label>
                      <input type="text" placeholder="Enter Library Card No" value={memberFormData.cardNo} onChange={(e) => setMemberFormData({ ...memberFormData, cardNo: e.target.value })} style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Class</label>
                      <input type="text" placeholder="Enter Class" value={memberFormData.className} onChange={(e) => setMemberFormData({ ...memberFormData, className: e.target.value })} style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Section</label>
                      <input type="text" placeholder="Enter Section" value={memberFormData.section} onChange={(e) => setMemberFormData({ ...memberFormData, section: e.target.value })} style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Student</label>
                      <select value={memberFormData.studentName} onChange={(e) => setMemberFormData({ ...memberFormData, studentName: e.target.value })} style={inputStyle}>
                        <option value="Select Student">Select Student</option>
                        <option value="Jon Dev">Jon Dev</option>
                        <option value="Emily Johnson">Emily Johnson</option>
                        <option value="Michael Brown">Michael Brown</option>
                        <option value="Sarah Lee">Sarah Lee</option>
                        <option value="William Smith">William Smith</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Book Issue Section (Screenshots 1 & 3 from latest batch) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {!isIssueOnlyModal && <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '2px', color: 'var(--text-primary)' }}>Book Issue</h4>}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Select Subject</label>
                    <select value={memberFormData.subject} onChange={(e) => setMemberFormData({ ...memberFormData, subject: e.target.value })} style={inputStyle}>
                      <option value="Select a Subject">Select a Subject</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="English">English</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Book</label>
                    <select value={memberFormData.bookName} onChange={(e) => setMemberFormData({ ...memberFormData, bookName: e.target.value })} style={inputStyle}>
                      <option value="Select a book">Select a book</option>
                      <option value="The Little Prince">The Little Prince</option>
                      <option value="Advanced Algebra">Advanced Algebra</option>
                      <option value="Physics for Beginners">Physics for Beginners</option>
                      <option value="JavaScript Essentials">JavaScript Essentials</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Issue Date</label>
                    <div style={{ position: 'relative' }}>
                      <input type="text" placeholder="dd/mm/yyyy" value={memberFormData.issueDate} onChange={(e) => setMemberFormData({ ...memberFormData, issueDate: e.target.value })} style={inputStyle} />
                      <Calendar size={16} style={{ position: 'absolute', right: '12px', top: '12px', color: '#64748b', pointerEvents: 'none' }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Return Date</label>
                    <div style={{ position: 'relative' }}>
                      <input type="text" placeholder="dd/mm/yyyy" value={memberFormData.returnDate} onChange={(e) => setMemberFormData({ ...memberFormData, returnDate: e.target.value })} style={inputStyle} />
                      <Calendar size={16} style={{ position: 'absolute', right: '12px', top: '12px', color: '#64748b', pointerEvents: 'none' }} />
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <button type="button" onClick={() => setIsMemberModalOpen(false)} className="btn btn-secondary" style={{ padding: '10px 32px', color: '#ef4444', borderColor: '#ef4444', fontWeight: 700, fontSize: '0.9rem' }}>Cancel</button>
              <button type="submit" form="member-form" className="btn btn-primary" style={{ padding: '10px 36px', backgroundColor: '#0d9488', color: '#ffffff', fontWeight: 700, fontSize: '0.9rem' }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Return Book Confirmation Centered Modal (Screenshot 4 from latest batch) */}
      {isReturnConfirmModalOpen && selectedReturnItem && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(3px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}
          onClick={() => setIsReturnConfirmModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card animate-fade-in"
            style={{
              width: '420px', maxWidth: '90vw', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', backgroundColor: '#ffffff', color: '#1e293b', boxShadow: '0 20px 40px rgba(0,0,0,0.25)', borderRadius: '16px'
            }}
          >
            {/* Book Icon Header in Teal Circle */}
            <div
              style={{
                width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#ccfbf1', border: '2px solid #0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px'
              }}
            >
              <BookOpen size={30} color="#0d9488" />
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Are your sure want to Return this book!
            </h3>

            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '24px' }}>
              Book: <strong>{selectedReturnItem.bookName}</strong> issued to <strong>{selectedReturnItem.issueTo}</strong>.
            </p>

            <div style={{ display: 'flex', gap: '16px', width: '100%', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setIsReturnConfirmModalOpen(false)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '10px 24px', color: '#ef4444', borderColor: '#ef4444', fontWeight: 700, fontSize: '0.9rem' }}
              >
                No
              </button>

              <button
                type="button"
                onClick={handleConfirmReturnBook}
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px 24px', backgroundColor: '#0d9488', color: '#ffffff', fontWeight: 700, fontSize: '0.9rem' }}
              >
                Yes Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Book Action Dropdown (Edit, Delete)
const BookActionDropdownCell = ({ isOpen, onToggle, onEdit, onDelete }) => {
  return (
    <div style={{ display: 'inline-flex', position: 'relative' }}>
      <button className="btn-icon" onClick={onToggle} style={{ width: '32px', height: '32px' }}>
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute', right: 0, top: '36px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)', border: '1px solid var(--border-color)', zIndex: 100, minWidth: '130px', display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}
        >
          <button onClick={onEdit} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', border: 'none', backgroundColor: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, textAlign: 'left' }}>
            <Edit size={14} color="#2563eb" /> Edit
          </button>
          <button onClick={onDelete} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', border: 'none', backgroundColor: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, textAlign: 'left', borderTop: '1px solid var(--border-light)' }}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

// Member Action Dropdown Cell (View, Edit, Issue Book, Delete)
const MemberActionDropdownCell = ({ isOpen, onToggle, onView, onEdit, onIssueBook, onDelete }) => {
  return (
    <div style={{ display: 'inline-flex', position: 'relative' }}>
      <button className="btn-icon" onClick={onToggle} style={{ width: '32px', height: '32px' }}>
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute', right: 0, top: '36px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)', border: '1px solid var(--border-color)', zIndex: 100, minWidth: '150px', display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}
        >
          <button onClick={onView} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', border: 'none', backgroundColor: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, textAlign: 'left' }}>
            <Eye size={14} color="#0d9488" /> View
          </button>
          <button onClick={onEdit} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', border: 'none', backgroundColor: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, textAlign: 'left', borderTop: '1px solid var(--border-light)' }}>
            <Edit size={14} color="#2563eb" /> Edit
          </button>
          <button onClick={onIssueBook} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', border: 'none', backgroundColor: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, textAlign: 'left', borderTop: '1px solid var(--border-light)' }}>
            <BookOpen size={14} color="#d97706" /> Issue Book
          </button>
          <button onClick={onDelete} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', border: 'none', backgroundColor: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, textAlign: 'left', borderTop: '1px solid var(--border-light)' }}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

// Issue Return Action Dropdown Cell (Return Book, Edit, Delete)
const IssueReturnActionDropdownCell = ({ isOpen, onToggle, onReturnBook, onEdit, onDelete }) => {
  return (
    <div style={{ display: 'inline-flex', position: 'relative' }}>
      <button className="btn-icon" onClick={onToggle} style={{ width: '32px', height: '32px' }}>
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute', right: 0, top: '36px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)', border: '1px solid var(--border-color)', zIndex: 100, minWidth: '150px', display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}
        >
          <button onClick={onReturnBook} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', border: 'none', backgroundColor: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, textAlign: 'left' }}>
            <RotateCcw size={14} color="#0d9488" /> Return Book
          </button>
          <button onClick={onEdit} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', border: 'none', backgroundColor: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, textAlign: 'left', borderTop: '1px solid var(--border-light)' }}>
            <Edit size={14} color="#2563eb" /> Edit
          </button>
          <button onClick={onDelete} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', border: 'none', backgroundColor: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, textAlign: 'left', borderTop: '1px solid var(--border-light)' }}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-app)',
  color: 'var(--text-primary)',
  fontSize: '0.875rem',
  outline: 'none',
  fontFamily: 'var(--font-sans)'
};
