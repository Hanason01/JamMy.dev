require 'json'

class Sse
  def initialize(stream)
    @stream = stream
  end

  def write(data, options = {})
    @stream.write("data: #{JSON.dump(data)}\n\n")
    @stream.flush
  end

  def close
    @stream.close
  end
end
