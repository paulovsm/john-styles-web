import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-white-pure border-t border-grey-light mt-auto">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm text-grey-medium">
                    &copy; {new Date().getFullYear()} John Styles Assistant. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
