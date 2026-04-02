import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UploadDropzone from '../UploadDropzone';

// Helper to create a mock File object
const createFile = (name, size, type) => {
  const file = new File(['x'.repeat(size)], name, { type });
  return file;
};

describe('UploadDropzone', () => {
  const defaultProps = {
    file: null,
    onFileSelect: jest.fn(),
    onFileRemove: jest.fn(),
    uploadProgress: null,
    isUploading: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dropzone when no file is selected', () => {
    render(<UploadDropzone {...defaultProps} />);
    expect(
      screen.getByText(/Drag & drop your mortgage offer/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Browse Files/i)).toBeInTheDocument();
  });

  it('shows file preview when a file is selected', () => {
    const file = createFile('offer.pdf', 1024, 'application/pdf');
    render(<UploadDropzone {...defaultProps} file={file} />);
    expect(screen.getByText('offer.pdf')).toBeInTheDocument();
    expect(screen.getByText('1.0 KB')).toBeInTheDocument();
  });

  it('shows remove button when file is selected and not uploading', () => {
    const file = createFile('offer.pdf', 1024, 'application/pdf');
    render(<UploadDropzone {...defaultProps} file={file} />);
    expect(screen.getByLabelText(/Remove offer.pdf/i)).toBeInTheDocument();
  });

  it('calls onFileRemove when remove button is clicked', () => {
    const file = createFile('offer.pdf', 1024, 'application/pdf');
    const onFileRemove = jest.fn();
    render(
      <UploadDropzone {...defaultProps} file={file} onFileRemove={onFileRemove} />
    );
    fireEvent.click(screen.getByLabelText(/Remove offer.pdf/i));
    expect(onFileRemove).toHaveBeenCalledTimes(1);
  });

  it('shows progress bar while uploading', () => {
    const file = createFile('offer.pdf', 1024, 'application/pdf');
    render(
      <UploadDropzone
        {...defaultProps}
        file={file}
        isUploading={true}
        uploadProgress={60}
      />
    );
    expect(screen.getByText('Uploading...')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('shows upload complete indicator when progress is 100 and not uploading', () => {
    const file = createFile('offer.pdf', 1024, 'application/pdf');
    render(
      <UploadDropzone
        {...defaultProps}
        file={file}
        isUploading={false}
        uploadProgress={100}
      />
    );
    expect(screen.getByText(/Upload complete/i)).toBeInTheDocument();
  });

  it('displays validation error message', () => {
    render(
      <UploadDropzone
        {...defaultProps}
        error="Invalid file type. Please upload a PDF, PNG, or JPG file."
      />
    );
    expect(
      screen.getByText(/Invalid file type/i)
    ).toBeInTheDocument();
  });

  it('hides remove button while uploading', () => {
    const file = createFile('offer.pdf', 1024, 'application/pdf');
    render(
      <UploadDropzone
        {...defaultProps}
        file={file}
        isUploading={true}
        uploadProgress={40}
      />
    );
    expect(screen.queryByLabelText(/Remove offer.pdf/i)).not.toBeInTheDocument();
  });

  it('calls onFileSelect with error for oversized file via input', () => {
    const onFileSelect = jest.fn();
    render(<UploadDropzone {...defaultProps} onFileSelect={onFileSelect} />);

    const input = document.querySelector('input[type="file"]');
    const bigFile = createFile('big.pdf', 6 * 1024 * 1024, 'application/pdf');

    Object.defineProperty(input, 'files', {
      value: [bigFile],
      configurable: true,
    });
    fireEvent.change(input);

    expect(onFileSelect).toHaveBeenCalledWith(
      null,
      expect.stringContaining('too large')
    );
  });

  it('calls onFileSelect with error for invalid file type via input', () => {
    const onFileSelect = jest.fn();
    render(<UploadDropzone {...defaultProps} onFileSelect={onFileSelect} />);

    const input = document.querySelector('input[type="file"]');
    const badFile = createFile('doc.docx', 1024, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    Object.defineProperty(input, 'files', {
      value: [badFile],
      configurable: true,
    });
    fireEvent.change(input);

    expect(onFileSelect).toHaveBeenCalledWith(
      null,
      expect.stringContaining('Invalid file type')
    );
  });

  it('calls onFileSelect with valid file via input', () => {
    const onFileSelect = jest.fn();
    render(<UploadDropzone {...defaultProps} onFileSelect={onFileSelect} />);

    const input = document.querySelector('input[type="file"]');
    const validFile = createFile('offer.pdf', 1024, 'application/pdf');

    Object.defineProperty(input, 'files', {
      value: [validFile],
      configurable: true,
    });
    fireEvent.change(input);

    expect(onFileSelect).toHaveBeenCalledWith(validFile, null);
  });

  it('applies drag-over styles when dragging over the zone', () => {
    render(<UploadDropzone {...defaultProps} />);
    const dropzone = screen.getByRole('button', {
      name: /Drag and drop your mortgage offer file here/i,
    });
    fireEvent.dragOver(dropzone);
    expect(screen.getByText(/Drop your file here/i)).toBeInTheDocument();
  });

  it('removes drag-over styles when drag leaves', () => {
    render(<UploadDropzone {...defaultProps} />);
    const dropzone = screen.getByRole('button', {
      name: /Drag and drop your mortgage offer file here/i,
    });
    fireEvent.dragOver(dropzone);
    fireEvent.dragLeave(dropzone);
    expect(
      screen.getByText(/Drag & drop your mortgage offer/i)
    ).toBeInTheDocument();
  });
});
