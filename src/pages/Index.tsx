import { ChessBoard } from '../components/ChessBoard';

const Index = () => {
  return (
    <div className="min-h-screen bg-background py-4 sm:py-6 md:py-8 px-2 sm:px-4">
      <div className="container mx-auto max-w-4xl">
        <ChessBoard />
      </div>
    </div>
  );
};

export default Index;